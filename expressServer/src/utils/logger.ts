import dayjs from 'dayjs'
import {createLogger, format, transports} from 'winston'

const timestampFormat = () => dayjs().format('DD.MM.YY HH:mm:ss')

const logger = createLogger({
	level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
	format: format.combine(
		format.errors({stack: true}),
		format.printf(({level, message, stack}) => {
			const ts = timestampFormat()
			const stackPreview = stack && typeof stack === 'string' ? '\n' + stack.split('\n').slice(1, 4).join('\n') : ''
			return `[${ts}] ${level.toUpperCase()}: ${message}${process.env.NODE_ENV !== 'production' ? stackPreview : ''}`
		}),
		format.colorize({all: true})
	),
	transports: [new transports.Console()]
})

export default logger
