var c = new Term(terminal);

// c.install('about', function (args, println, exit) {
//     println('Thanks for asking!<br>This Terminal is made by <a href="http://www.vitim.com.br">Victor</a>');
//     exit();
// }, {
//     desc: 'Display info about this terminal',
//     help: 'Just type about command and hit enter'
// });

// c.install('sum', function (args, println, exit) {
//     var r = parseFloat(args[1]) + parseFloat(args[2]);
//     println("result " + r);
//     exit();
// }, {
//     desc: 'Sum two numbers together and display the result',
//     help: 'Command syntax\nsum [number] [number]'
// });

// c.install('calc', function (print, read) {
//     print('type your name:');
//     read(function (str) {
//         print('hello', str);
//     });
// }, {
//     desc: "A calculator",
//     interactive: true,
// });

// c.install('token', function (print, read) {
//     print('type your name:');
//     read(function (str) {
//         print('hello', str);
//     });
// }, {
//     desc: "A calculator",
//     interactive: true,
// });

// c.install('logout', function (print, read) {
//     print('type your name:');
//     read(function (str) {
//         print('hello', str);
//     });
// }, {
//     desc: "A calculator",
//     interactive: true,
// });

// c.install('forceToken', function (print, read) {
//     print('type your name:');
//     read(function (str) {
//         print('hello', str);
//     });
// }, {
//     desc: "A calculator",
//     interactive: true,
// });



c.install('foo', {
    name: 'foo',
    desc: '',
    fn: async function () {

        var name, age, color;

        this.println("Welcome!");
        this.println("Please type your name!");
        name = await this.readln();
        this.println("Type your age");
        age = await this.readln();
        this.println("Type your fav color");
        color = await this.readln();

        this.println(`Hi <span style="color:${color};">${name}</span>!`);
    }
});

c.install('bar', {
    name: 'bar',
    desc: '',
    fn: function () {
        return new Promise((exit)=>{
            var name, age, color;
    
            this.println("Welcome!");
            this.println("Please type your name!");
            this.readln()
                .then((line) => {
                    name = line;
    
                    return new Promise((resolve) => {
                        this.println("Please wait...");
                        var s = Date.now();
                        var t = setInterval(() => {
                            if (Date.now() - s < 5E3) {
                                this.write(Date.now());
                            } else {
                                clearInterval(t);
                                resolve();
                            }
                        }, 500);
                    });
    
                })
                .then((line) => {
    
                    this.println("Type your fav color");
                    return this.readln();
                })
                .then((line) => {
                    color = line;
                    this.println("Thanks");
                    this.println(`Your name is ${name} you're ${age} years old and your favorite color is ${color}.`);
                    exit();
                });

        });
    }
});

c.install('sum', {
    name: 'sum',
    desc: '',
    fn: async function (args) {

        // args = args.split(' ');
        var a = parseFloat(args[0], 10);
        var b = parseFloat(args[1], 10);
        var r = a + b;

        this.println("Result = " + (r));
    }
});

c.install('clear', {
    name: 'clear',
    desc: '',
    fn: function (args) {
        this.clear();
    }
});

c.install('about', {
    name: 'about',
    desc: 'Display information about this terminal',
    help: 'Just type about.',
    fn: function (args) {
        this.println("This is provided to you by Victor! ;D");
    }
});

c.install('broken', {
    name: 'broken',
    desc: '',
    fn: function (args) {
        this.println("This is provided to you by Victor! ;D");
        functionThatDoesNotExists();
    }
});




c.install('calc', {
    name: 'calc',
    desc: '',
    fn: async function () {

        this.println("Welcome!");

        var line;

        this.println("Please type an expression");
        do {
            line = await this.readln();
            this.println(eval(line));

        }
        while (line !== 'exit');

        this.exit();
    }
});


c.install('help', {
    name: 'help',
    desc: 'Display the list of commands',
    fn: async function (args) {

        if(args.length){
            let cmd = c.commands[args[0]];
            if(cmd){
                let help = cmd.help || "No help for this command"
                this.println(help);
            }
            else{
                this.println('The command does not exist');
            }
        }
        else{
            
            this.println("List of commands:");
            Object.keys(c.commands).sort().map((name) => {
                let cmd = c.commands[name];
                this.println(` - ${name}    ${cmd.desc}`);
            });
        }

        return;
    }
});