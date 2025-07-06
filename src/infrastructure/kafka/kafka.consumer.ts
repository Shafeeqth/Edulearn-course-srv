import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { Consumer, Kafka } from "kafkajs";
import { LoggingService } from "src/infrastructure/observability/logging/logging.service";
import { AppConfigService } from "../config/config.service";

@Injectable()
export class KafkaConsumer implements OnModuleInit, OnModuleDestroy {
  private consumer: Consumer;

  constructor(
    private readonly configService: AppConfigService,
    private readonly logger: LoggingService,
  ) {
    const kafka = new Kafka({
      clientId: this.configService.kafkaClientId,
      brokers: this.configService.kafkaBrokers,
    });
    this.consumer = kafka.consumer({
      groupId: this.configService.kafkaConsumerGroup,
    });
  }

  async onModuleInit() {
    await this.consumer.connect();
    this.logger.info(`Kafka Consumer connected`);

    await this.consumer.subscribe({
      topic: "course-events",
      fromBeginning: true,
    });

    await this.consumer.run({
      eachMessage: async ({ topic, message }) => {
        const payload = JSON.parse(message.value.toString());
        this.logger.debug(
          `Received message from topic ${topic}: ${JSON.stringify(payload)}`,
        );
      },
    });
  }

  async onModuleDestroy() {
    await this.consumer.disconnect();
    this.logger.info("Kafka consumer disconnected");
  }
}
