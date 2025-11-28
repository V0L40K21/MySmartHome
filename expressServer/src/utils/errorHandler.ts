import {NextFunction, Request, Response} from 'express'

import logger from './logger'

export class AppError extends Error {
	statusCode: number
	constructor(message: string, statusCode = 500) {
		super(message)
		this.statusCode = statusCode
	}
}

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
	logger.error(err)

	if (res.headersSent) {
		return next(err)
	}

	const status = err.statusCode || 500
	const isDev = process.env.NODE_ENV !== 'production'

	res.status(status).json({
		success: false,
		message: err.message,
		...(isDev ? {stack: err.stack} : {})
	})
}
