const fs = require('fs');
const path = require('path');
const readline = require('readline');
const pkg = require('../package.json');
const os = require('os');
const { exitCode } = require('process');

const argv = process.argv.slice(2);
const [command, subcommand, ...rest] = argv;

const CONFIG_PATH = path.join(os.homedir(), '.hello-cli.json');

function loadConfig () {
    try{
      const raw = fs.readFileSync(CONFIG_PATH, 'utf-8');
      return JSON.parse(raw);     
    } catch {
      return{};
    }
}

function saveConfig(cfg) {
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(cfg, null, 2), 'utf-8');
}

function printHelp() {
    console.log('uasge:');
    console.log('hello <comand> [options]\n')
    console.log('commands:')
    console.log(' help         show help')
    console.log(' init         create or update config')
    console.log(' greet        [--name| -n]    Greeting')
    console.log(' add          [a b c ...]    Summa digit')
    console.log(' now          show date and time at the moment');
    console.log(' version      show version of the program');
    // console,log('\n all options')
}


function parseFlags(args) {
  const flags = {_: [] }

  for( let i = 0; i < args.length; i ++ ) {
    const a = args[i];
    if (a === "-n" || a === "--name") {
      flags.name = args[i + 1];
      i++;
    } else if (a.startsWith("--name")) {
      flags.name = a.splice("=")[1];
    } else if (a.startsWith('-')) {
      if(!flags.unknown) flagslags.unknown = [];
      flags.unknown.push(a);
    } else {
      flags._.push(a);
    }
  }

  return flags;
}

async function prompt(question) {
  const rl = readline.createInterface({input: process.stdin, output: process.stdout});
  const answer = await new Promise((resolve)  => rl.question(question, resolve));
  rl.close();

  return answer;
}

async function main() {
  if(!command || command === 'help' || rest.includes('-h') || rest.includes('--help') ) {
    return printHelp();
  }

  const flags = parseFlags(rest)
  if(flags.unknown && flags.unknown.length){
    console.warn(`Alert`)
  }

  const cfg = loadConfig();
  
  switch (command) {
    case 'version': {
      console.log(pkg.version);
      break;
    }

    case 'config': {
      if(subcommand === 'get'){
        console.log('Вот что вывело при get', cfg)
      }else if (subcommand === 'set') {
        const  [key, value] = rest
        cfg[key] = value;
        saveConfig(cfg);
        console.log(`Config updated: ${key} = ${value}`);
      }

      break;
    }

    case 'now': {
      Console.log(new Date().toString());
      break;
    }

    case 'init': {
      let name = flags.name;
      if (!name) {
      name = await prompt("how can i talk with you");
      }
      const next = { ...cfg, name };
      saveConfig(next);

      console.log(`Ready! config saved in ${CONFIG_PATH}`);
      break;
    }

    case 'greet': {
      const name = flags.name || cfg.name || "user";
      console.log(`Hello, ${name}!`);

      if (!cfg.name && !flags.name) {
      console.log('helper: save name by command: init `hello init --name Fedor');
      }    

      break;
    }

    case 'add': {
      let nums = flags._.length ? flags._ : null;
      if (!nums){
        const line = await prompt('Input numbers throw space')
        nums = line.split(/\s+/).filter(Boolean);
      }

      const values = nums.map(Number);
      if (values.some(Number.isNaN)) {
        console.error("error: all args need to be numbers");
        process.exitCode = 1;

        return;
      }

      const sum = values.reduce((a, b) => a +b, 0);
      console.log(`Summa: ${sum}`);
      break;
    }

    default: {
      console.error(`Unknown Command: ${command}`);
      printHelp();
      process.exitCode = 1;
    }
  }
}

main().catch((e) => {
  console.error(e.stack || String(e));
  process.exit(1);
});