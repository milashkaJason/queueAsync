class Parallel {
    static result = []
    static callBackCount = 0

    constructor({...data}) {
        this.concurrent = 0;
        this.parallelJobs = data.parallelJobs
        this.queue = []
        this.jobCount = 0
    }

    async next() {
        if (this.queue.length && this.concurrent < this.parallelJobs) {
            this.concurrent += 1;
            const fnc = this.queue.shift();
            this.next();
            await fnc();
            this.concurrent -= 1;
            this.next();
        }
    }

    job(step) {
        ++this.jobCount
        const p = new Promise((res) => {
            const fnc = async () => {
                await step(this.callBack);
            };
            this.queue.push(fnc);
            Parallel.result.push(step.name)
            this.next();
        });

        return this;
    }

    callBack(arg) {
        ++Parallel.callBackCount
    }

    done(onDone) {
        setTimeout(() => {
            if (this.jobCount === Parallel.callBackCount) {
                onDone(Parallel.result)

            } else {
                this.done(onDone)
            }
        }, 0)
    }

}

const runner = new Parallel({
    parallelJobs: 2
});


function step1(done) {
    setTimeout(done, 100, "step1");
}

function step2(done) {
    setTimeout(done, 10, "step2");
}

function step3(done) {
    setTimeout(done, 150, "step3");
}

function step4(done) {
    setTimeout(done, 50, "step4");
}

function onDone(results) {
    console.assert(Array.isArray(results), "result must be an array");
    console.assert(results.length === 4, "Wrong count of answers");
    console.assert(results[0] === "step1", "Wrong answer 1");
    console.assert(results[1] === "step2", "Wrong answer 2");
    console.assert(results[2] === "step3", "Wrong answer 3");
    console.assert(results[3] === "step4", "Wrong answer 4");
}

runner.job(step1).job(step2).job(step3).job(step4).done(onDone)
