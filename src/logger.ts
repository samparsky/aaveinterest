import winston from 'winston'

const logger = winston.createLogger({
	level: 'info',
	format: winston.format.json(),
	transports: [
		//
		// - Write to all logs with level `info` and below to `combined.log`
		// - Write all logs error (and below) to `error.log`.
		//
		new winston.transports.Console({
			format: winston.format.combine(
				winston.format.colorize({ all: true }),
				winston.format.simple(),
				winston.format.printf(info => `${info.message}`)
			)
		})
	]
})

export default function(prefix: string) {
	return {
		error(text: string) {
			logger.error(`${prefix}: ${text}`)
		},
		info(text: string) {
			logger.info(`${prefix}: ${text}`)
		}
	}
}