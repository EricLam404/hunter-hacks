import { Request, Response, NextFunction } from "express";

export function loggingHandler(
    req: Request,
    res: Response,
    next: NextFunction
) {
    logging.log(
        `Incomming - METHOD: [${req.method}] - URL: [${req.url}] - IP: [${req.socket.remoteAddress}] \n Origin: [${req.headers.origin}]`
    );

    res.on("finish", () => {
        logging.log(
            `Result - METHOD: [${req.method}] - URL: [${req.url}] - IP: [${req.socket.remoteAddress}] - STATUS: [${res.statusCode}] \n Origin: [${req.headers.origin}]`
        );
    });

    next();
}
