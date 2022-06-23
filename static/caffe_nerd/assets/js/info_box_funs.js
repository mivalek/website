function setNextButtonText(text) {
    document.getElementById("next-instruction").innerText = text;
}

function toggleNextButton() {
    const next = document.getElementById("next-instruction");
    next.className == "active"
        ? next.classList.remove("active")
        : next.classList.add("active");
}

function setText(x) {
    const infoBox = document.getElementById("info");
    const pic = infoBox.children[0];
    infoBox.innerHTML = pic.outerHTML + x;
}

function Customer(avatar, order, happy, unhappy, lines) {
    this.lines = lines;
    this.avatar = avatar;
    this.order = order;
    this.happy = happy;
    this.unhappy = unhappy;

    this.setAvatar = function (x) {
        return new Promise((resolve) => {
            const picContainer = document.querySelector("#character");
            const pic = new Image();
            pic.onload = function () {
                picContainer.innerHTML = "<div id='drink'></div>";
                picContainer.appendChild(pic);
                picContainer.classList.remove("hidden");
                sleep(300).then(() => {
                    console.log("avatar set");
                    resolve();
                });
            };

            pic.src = "./assets/img/characters/" + x + ".svg";
        });
    };

    this.addLine = function (str) {
        if (Array.isArray(str)) {
            str.forEach((l) => this.lines.push(l));
            return;
        }
        this.lines.push(str);
    };

    this.sayLine = function () {
        setText(this.lines.shift());
    };

    this.enter = function () {
        return new Promise((resolve) => {
            pic = new Image();
            enterSound.play();
            sleep(500).then(() => {
                console.log("pause after sound");
                this.setAvatar(this.avatar).then((result) => {
                    setText(this.order);
                    sleep(500).then(() => {
                        console.log("resolved");
                        resolve();
                    });
                });
            });
        });
    };

    this.frown = function () {
        return new Promise((resolve) => {
            this.setAvatar(this.avatar + "_frown").then(() => resolve());
        });
    };

    this.angry = function () {
        return new Promise((resolve) => {
            this.setAvatar(this.avatar + "_angry").then(() => resolve());
        });
    };

    this.changeMood = function (worsen = true) {
        return new Promise((resolve) => {
            const currentMood = document
                .querySelector("#character img")
                .getAttribute("src");
            if (worsen) {
                this.setAvatar(
                    this.avatar +
                        (["angry", "frown"].includes(
                            currentMood.replace(/.*?_(.*).svg/, "$1")
                        )
                            ? "_angry"
                            : "_frown")
                )
                    .then(() => {
                        if (currentMood.includes("frown")) {
                            grunt.play();
                        } else if (!currentMood.includes("angry")) tut.play();
                    })
                    .then(() => resolve());
            } else {
                this.setAvatar(
                    this.avatar +
                        (currentMood.includes("angry")
                            ? "_frown"
                            : currentMood.includes("frown")
                            ? ""
                            : "_smile")
                ).then(() => resolve());
            }
        });
    };

    this.getDrink = function (drink) {
        return new Promise((resolve) => {
            drink = drink.replaceAll(/olate|bubble_/g, "");
            this.changeMood(false).then(() => {
                const handType = (Math.random() > 0.5) + 1;
                const flip = Math.random() > 0.5;
                const pic = document.querySelector("#character img");
                const drinkDiv = document.querySelector("#character #drink");
                drinkDiv.classList.add(
                    "active",
                    drink + handType,
                    this.avatar.replaceAll(/\d/g, "")
                );
                if (flip) drinkDiv.classList.add("flip");
                sleep(1500).then(() => resolve());
            });
        });
    };

    this.exit = function (served = false) {
        return new Promise((resolve) => {
            toggleActive(document.getElementById("order"));
            const pic = document.querySelector("#character img");
            setText(served ? this.happy : this.unhappy);
            if (served) yay.play();
            sleep(800)
                .then(function (result) {
                    return new Promise((resolve) => {
                        document
                            .querySelector("#character img")
                            .parentElement.classList.add("hidden");
                        sleep(500).then(() => {
                            console.log("avatar exited");
                            resolve();
                        });
                    });
                })
                .then(function (result) {
                    return new Promise((resolve) => {
                        setText("");
                        document.querySelector("#character #drink").className =
                            "";
                        sleep(10).then(() => {
                            console.log("drink removed");
                            resolve();
                        });
                    });
                })
                .then((result) => {
                    console.log("customer.exit() promise resolved");
                    resolve();
                });
        });
    };
}

function Boss(data = bossData) {
    this.avatar = data.avatar;
    this.greeting = data.greeting;
    this.lines = data;
    this.tasks = data.tasks;
    this.setAvatar = function (str, enter = false) {
        return new Promise((resolve) => {
            pic = new Image();
            const picContainer = document.querySelector("#character");
            pic.onload = function () {
                picContainer.innerHTML = "<div id='drink'></div>";
                picContainer.appendChild(pic);
                picContainer.classList.remove("hidden");
                if (enter) picContainer.classList.remove("hidden");
                resolve();
            };
            pic.src = "./assets/img/characters/" + str + ".svg";
        });
    };

    this.enter = function (greet = true, toggleButton = true) {
        this.setAvatar(this.avatar, true).then(() =>
            sleep(500).then(() => {
                if (greet) {
                    setText(this.greeting);
                } else {
                }
                if (toggleButton) toggleNextButton();
            })
        );
    };

    this.exit = function () {
        document.getElementById("character").classList.add("hidden");
        sleep(500).then(() => {
            setText("");
            document.querySelector("#character #drink").className = "";
        });
    };

    this.feedback = function (success = true, line) {
        const avatarIndex = (Math.random() > 0.5) + 1;
        if (success) {
            if (!line)
                line = Math.floor(
                    Math.random() * (this.lines.praise.length - 1)
                );
            this.setAvatar(this.avatar + "_wd" + avatarIndex).then(() =>
                setText(this.lines.praise[line])
            );
        } else {
            if (!line)
                line = Math.floor(
                    Math.random() * (this.lines.encourage.length - 1)
                );
            this.setAvatar(this.avatar + "_nvm" + avatarIndex).then(() =>
                setText(this.lines.encourage[line])
            );
        }
    };

    this.instruction = function (n) {
        const avatarIndex = Math.floor(Math.random() * 3);
        this.setAvatar(
            this.avatar + (avatarIndex ? "_instruction" + avatarIndex : "")
        ).then(() => {
            instruction = this.lines.instructions.shift();
            setText(instruction.text);
            if (instruction.task) {
                thisTask = instruction;
                runTask(instruction.id);
            }
            if (instruction.buttonText)
                setNextButtonText(instruction.buttonText);
            if (instruction.toggleButton) toggleNextButton();
            if (instruction.drink) this.getDrink();

            // if (this.lines.instructions.length === 0)
            //     sleep(2000).then(() => this.exit());
        });
    };

    this.getDrink = function () {
        const pic = document.querySelector("#character img");
        const drinkDiv = document.querySelector("#character #drink");
        drinkDiv.classList.add("active", "choc1", "white", "flip");
    };
}
