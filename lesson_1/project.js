const http = require("http");
const fs = require("fs");
const { Transform, pipeline } = require("stream");
const EventEmitter = require("events");

const PORT = 3000;

class UpperCaseStream extends Transform {
  _transform(chunk, _encoding, callback) {
    callback(null, chunk.toString().toUpperCase());
  }
}

class Logger extends EventEmitter {
  info(msg) {
    console.log(`[SERVER INFO]: ${msg}`);
    this.emit("info", msg);
  }

  warn(msg) {
    console.warn(`[SERVER WARN]: ${msg}`);
    this.emit("warn", msg);
  }

  error(msg) {
    console.error(`[SERVER ERROR]: ${msg}`);
    this.emit("error", msg);
  }
}

const logger = new Logger();

const server = http.createServer((req, res) => {
  if (req.method === "GET" && req.url === "/") {
    logger.info("Получен GET-запрос на главную страницу");

    res.writeHead(200, { "content-type": "text/plain; charset=utf-8" });

    const src = fs.createReadStream("data.txt");
    const upper = new UpperCaseStream();
    // const dest = fs.createWriteStream('UpperfromServer.txt')

    pipeline(src, upper,  res, (err) => {
      if (err) {
        logger.error(`Ошибка обработки потока: ${err.message}`);

        if (!res.headersSent) {
          logger.warn("Заголовки ещё не отправлены, устанавливаем 500");
          res.writeHead(500, { "content-type": "text/plain; charset=utf-8" });
        }

        if (!res.writableEnded) {
          logger.error("Завершаем ответ с сообщением об ошибке");
          res.end("Ошибка обработки файла");
        }
      } else {
        logger.info("Файл успешно отправлен клиенту");
      }
    });
  } else {
    logger.warn(`Неизвестный путь или метод: ${req.method} ${req.url}`);
    res.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
    res.end("Страница не найдена");
  }
});

server.listen(PORT, () => {
  logger.info(`Сервер запущен на порту ${PORT}`);
});
