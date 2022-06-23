const customerData = [
    {
        drink: "coffee",
        size: "medium",
        tea: null,
        milk: "almond",
        syrup: "none",
        topping: "none",
        happy: "Lovely, thanks a lot. Have a great day!",
        unhappy: "I'll try another time, you seem busy...",
        lines: ["First days can be tough, I know!", "Is everything OK, buddy?"],
        get order() {
            return `Hiya! Can I please get a ${this.size} ${this.drink} with ${this.milk} milk. No syrup or toppings, thank you.`;
        },
    },
    {
        drink: "chocolate",
        size: "large",
        tea: null,
        milk: "dairy",
        syrup: "none",
        topping: "none",
        happy: "Amazing, thank you!",
        unhappy: "Seriously? I don't have all day. See you.",
        lines: [
            "Could someone else make this drink for me?",
            "How long will I have to wait?",
        ],
        get order() {
            return `Hi, I'd like a ${this.size} ${this.drink} with ${this.milk} milk. No syrup or toppings.`;
        },
    },
    // {
    //     drink: "bubble_tea",
    //     size: "small",
    //     tea: "black",
    //     milk: "almond",
    //     syrup: null,
    //     topping: "tapioca pearls",
    //     happy: "Wow, thank you!",
    //     unhappy: "It's alright I guess",
    //     lines: ["Everything okay?", "No pressure!"],
    //     get order() {
    //         return `Can you make me a ${this.size} ${
    //             this.tea
    //         } ${this.drink.replace("_", " ")} with ${this.milk} milk and ${
    //             this.topping
    //         }.`;
    //     },
    // },
    // {
    //     drink: "coffee",
    //     size: "medium",
    //     tea: null,
    //     milk: "dairy",
    //     syrup: "vanilla",
    //     topping: "cinnamon",
    //     happy: "This looks good! Bye now!",
    //     unhappy: "Oh, thank you anyway…",
    //     lines: ["How's it going with my coffee?", "Did you forget my order?"],
    //     get order() {
    //         return `Hi, I'd love a ${this.size} ${this.drink} with ${this.milk} milk, ${this.syrup} syrup and ${this.topping} on top please!`;
    //     },
    // },
    {
        drink: "coffee",
        size: "small",
        tea: null,
        milk: "dairy",
        syrup: "none",
        topping: "none",
        happy: "Lovely, Thanks!",
        unhappy: "It's okay, I'll just find a different café.",
        lines: [
            "Is everything okay?",
            "I need to be going soon, how long will it be?",
        ],
        get order() {
            return `Hmm, could you do a ${this.size} ${this.drink} with ${this.milk} milk, no syrup or toppings please!`;
        },
    },
    {
        drink: "coffee",
        size: "large",
        tea: null,
        milk: "almond",
        syrup: "chocolate",
        topping: "cocoa",
        happy: "Not bad at all... Have a good one!",
        unhappy: "I guess there's nobody here who can make me a drink...",
        lines: [
            "Hey, just wondering if this will take long?",
            "Everything okay?",
        ],
        get order() {
            return `Hello, a ${this.size} ${this.drink} with ${this.milk} milk, ${this.syrup} syrup and ${this.topping} topping please!`;
        },
    },
    {
        drink: "bubble_tea",
        size: "large",
        tea: "green",
        milk: "dairy",
        syrup: null,
        topping: "grass jelly",
        happy: "Cheers!",
        unhappy: "I should talk to your manager! Now I'm late for work…",
        lines: [
            "I'm in a rush, could you hurry this along?",
            "Is this your first day?",
        ],
        get order() {
            return `Hi, can you quickly make me a ${
                this.size
            } ${this.drink.replace("_", " ")} with ${this.tea} tea flavor, ${
                this.milk
            } milk and ${this.topping} toppings please!`;
        },
    },
    {
        drink: "chocolate",
        size: "medium",
        tea: null,
        milk: "almond",
        syrup: "none",
        topping: "cocoa",
        happy: "This must be the tastiest hot chocolate I have had!",
        unhappy: "Do you know what? Forget about it!",
        lines: [
            "Is everything okay?",
            "I can't believe how long this is taking?",
        ],
        get order() {
            return `Hi there, I'd like to order a ${this.size} ${this.drink} with ${this.milk} milk and a little ${this.topping} on top please!`;
        },
    },
    {
        drink: "bubble_tea",
        size: "large",
        tea: "black",
        milk: "dairy",
        syrup: null,
        topping: "tapioca pearls",
        happy: "Thank you so much!",
        unhappy: "I'll... Try a different café. Thanks.",
        lines: [
            "this is taking too long, I am going to be late for work?",
            "Is the drink ready?",
        ],
        get order() {
            return `Hi, can you quickly make me a ${
                this.size
            } ${this.drink.replace("_", " ")} with ${this.tea} tea flavor, ${
                this.milk
            } milk and ${this.topping} please!`;
        },
    },
    {
        drink: "coffee",
        size: "large",
        tea: null,
        milk: "none",
        syrup: "none",
        topping: "cinnamon",
        happy: "Cheers mate!",
        unhappy: "Sorry, I don't have time for this. Cancel the order.",
        lines: [
            "Is everything alright?",
            "You didn't forget about my order did you?",
        ],
        get order() {
            return `Hi, I would like a ${this.size} ${this.drink} and  ${this.topping} toppings with no milk and syrup`;
        },
    },
];
