class Term {
    constructor(elm) {
        this.output = elm.querySelector('[name="output"]');
        this.input = elm.querySelector('[name="input"]');

        this.commands = {};

        this.inputBuffer = [];

        this.stack = [];

        this.historyI = 0;
        this.history = [];

        this.ready();
    }

    ready() {
        console.log('waiting for input');
        var that = this;
        const MAX_HISTORY = 25;

        this.input.disabled = false;
        this.input.focus();
        this.input.onkeyup = function consoleStdin(e) {
            console.log('Console input', e.keyCode);
            var cmd;
            if (e.keyCode === 13) {
                cmd = this.value;
                this.value = "";
                that.input.onkeyup = null;

                that.history.unshift(cmd);
                if (that.history.length > MAX_HISTORY) that.history.pop();
                that.historyI = 0;

                that.exec(cmd);
            } else if (e.keyCode === 38) { //UP
                e.preventDefault();
                if (that.historyI < that.history.length)
                    this.value = that.history[that.historyI++];
            } else if (e.keyCode === 40) { //DOWN
                e.preventDefault();
                if (that.historyI > 0)
                    this.value = that.history[--that.historyI];
            }
        };
    }

    exec(command) {
        command = command.split(' ');

        const progName = command[0];
        const args = command.slice(1);

        const t = new CommandApi(this.input, this.output);

        t.println('> ' + command.join(' '));

        const cmd = this.commands[progName];
        if (cmd) {

            // this.stack.push(cmd);

            if (typeof cmd.fn === 'function') {
                console.info('program started', progName);
                try {
                    //execute
                    var r = cmd.fn.call(t, args);

                    if(r instanceof Promise) {
                        r.then((r)=>{
                            console.info('asynchronous program exited!', r);
                            this.ready();
                        }).catch((err)=>{
                            console.error('async exception', err);
                            t.println("ERROR! " + err);
                            this.ready();
                        });
                    }
                    else {
                        console.info('sync program exited!', r);
                        this.ready();
                    }

                } catch (err) {
                    console.error('exception', err);
                    t.println("ERROR! " + err);
                    this.ready();
                }
            } else {
                t.println("Command is invalid!");
                this.ready();
            }

        } else {
            t.println("Command not found! " + progName);
            var s = this.suggestions(progName);
            if (s.length) t.println("Suggested commands: " + s + "");

            this.ready();
        }
    }

    install(name, obj) {
        this.commands[name] = obj;
    }

    suggestions(name) {
        const suggestions = [];
        Object.keys(this.commands).forEach(function (k) {
            const s = calcSimilarity(name, k);
            if (s >= 0.1) suggestions.push(k);
            // console.log(s, k, name);
        });
        return suggestions;
    }

    abort() {
        //TODO
    }

    destroy() {
        //TODO
    }

}

class CommandApi {
    constructor(input, output) {
        this.input = input;
        this.output = output;
        this.currDiv;
    }
    println(text) {
        var div = document.createElement('div');
        div.innerHTML = String(text).replace(/\n/g, '<br>');
        this.output.appendChild(div);
        this.currDiv = div;

        this.output.scrollTop = this.output.scrollHeight;
    }
    write(text) {
        if (this.currDiv) {
            this.currDiv.innerHTML = String(text).replace(/\n/g, '<br>');
        } else {
            var div = document.createElement('div');
            div.innerHTML = String(text).replace(/\n/g, '<br>');
            this.output.appendChild(div);
            this.currDiv = div;
        }
    }
    clear() {
        this.output.innerHTML = "";
    }
    readln() {
        var _this = this;

        //enable input
        this.input.disabled = false;
        this.input.focus();

        return new Promise((resolve) => {
            this.input.onkeyup = function stdin(e) {
                var cmd;
                if (e.keyCode === 13) {
                    cmd = this.value;
                    this.value = "";

                    //disable input
                    _this.input.onkeyup = null;
                    _this.input.disabled = true;

                    resolve(cmd);
                }
            };
        });
    }
    
}

function calcSimilarity(l, m) {
    var g = l,
        h = m,
        k = g.length,
        f = h.length;
    if (k < f) {
        var d = g;
        g = h;
        h = d;
        var b = k;
        k = f;
        f = b;
    }
    b = [
        []
    ];
    for (d = 0; d < f + 1; ++d) {
        b[0][d] = d;
    }
    for (var c = 1; c < k + 1; ++c) {
        b[c] = [];
        b[c][0] = c;
        for (var e = 1; e < f + 1; ++e) {
            d = g.charAt(c - 1) === h.charAt(e - 1) ? 0 : 1, b[c][e] = Math.min(b[c - 1][e] + 1, b[c][e - 1] + 1, b[c - 1][e - 1] + d);
        }
    }
    return 1 - b[b.length - 1][b[b.length - 1].length - 1] / Math.max(l.length, l.length);
}


function WebConsole(){

    this.DOM = {
        container: document.createElement('div'),
        output: document.createElement('div'),
        input: document.createElement('div')
    };
}


document.body.onkeyup = function (e) {
    if (e.keyCode === 192 && e.ctrlKey === true) {
        var term = document.createElement('div');
        term.style.cssText = [
            'position:fixed',
            'top: 5px',
            'left: 5px',
            'width: 90vw',
            'height: 90vh',
            'z-index:999998', //below chat

            'font-family: "Menlo", "Consolas", monospace',
            'font-size: 10px',
            'color: #fff',
            'background: #000',
            'text-align: center'
        ].join('; ');
        term.innerHTML = "<b>Copy the last captured error by pressing <kbd>CTRL</kbd>+<kbd>C</kbd></b> <i>(Press <kbd>ESC</kbd> to quit)</i>";
        document.body.appendChild(term);

        var txtarea = document.createElement('textarea');
        term.appendChild(txtarea);
        txtarea.setAttribute("spellcheck", "false");
        txtarea.setAttribute("placeholder", "Empty");
        txtarea.style.cssText = [
            // 'position:absolute',
            // 'top:5px',
            // 'left:5px',
            'width:100%',
            'height:100%',

            'font-family: "Menlo", "Consolas", monospace',
            'font-size: 10px',
            'color: #ffb566',
            'background: #0d3f36',
            'white-space: pre',
            'text-rendering: optimizeSpeed',
            '-webkit-font-smoothing: none'
        ].join('; ');

        txtarea.close = function () {
            txtarea.onkeyup = null;
            txtarea.onblur = null;
            document.body.removeChild(term);
        };
        txtarea.onblur = function () {
            // t.close();
        };
        txtarea.onkeyup = function (e) {
            if (e.keyCode === 27) {
                txtarea.close();
            }
        };


        txtarea.innerHTML = "Wait...";
        setTimeout(function () {
            txtarea.innerHTML = window.DUMP ? JSON.stringify(window.DUMP, null, "\t") : "";
            txtarea.focus();
            txtarea.select();
        }, 1);

    }
};