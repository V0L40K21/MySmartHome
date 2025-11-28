import mqtt from 'mqtt'

import logger from './logger'

export const deviceState: Record<string, any> = {}
const MQTT_URL = process.env.MQTT_URL ?? 'mqtt://localhost:1883'
export const mqttClient = mqtt.connect(MQTT_URL)
mqttClient.on('connect', () => {
	logger.info(`MQTT подключен к ${MQTT_URL}`)
	mqttClient.subscribe('state/#', err => {
		if (err) {
			logger.error(`MQTT subscribe error ${err.message}`)
		} else {
			logger.info(`MQTT подписан на топик state/#`)
		}
	})
})

mqttClient.on('message', (topic, message) => {
	try {
		const data = JSON.parse(message.toString())
		const [, deviceId] = topic.split('/')
		logger.debug(`MQTT state update for ${deviceId}: ${message.toString()}`)
		deviceState[deviceId] = {
			...deviceState[deviceId],
			...data,
			updatedAt: Date.now()
		}
	} catch (e: any) {
		logger.error('MQTT message error: ' + e.message)
	}
})
