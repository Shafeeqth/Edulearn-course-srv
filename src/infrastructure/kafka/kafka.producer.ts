import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { Kafka, Producer } from "kafkajs";
import { AppConfigService } from "../config/config.service";
import { LoggingService } from "src/infrastructure/observability/logging/logging.service";
import { TracingService } from "../observability/tracing/trace.service";

@Injectable()
export class KafkaProducer implements OnModuleInit, OnModuleDestroy {
  private producer: Producer;
  constructor(
    private readonly configService: AppConfigService,
    private readonly logger: LoggingService,
    private readonly tracer: TracingService
  ) {
    const kafka = new Kafka({
      clientId: this.configService.kafkaClientId,
      brokers: this.configService.kafkaBrokers,
    });
    this.producer = kafka.producer();
  }

  async onModuleInit() {
    await this.producer.connect();
    this.logger.info(`Kafka Producer connected ${KafkaProducer.name}`);
  }

  async onModuleDestroy() {
    await this.producer.disconnect();
    this.logger.info(`Kafka Producer disconnected ${KafkaProducer.name}`);
  }

  async sendMessage(topic: string, message: any) {
    return this.tracer.startActiveSpan(
      "KafkaProducer.sendMessage",
      async (span) => {
        try {
          span.setAttribute("kafka.topic", topic);
          span.setAttribute("kafka.message", JSON.stringify(message));

          await this.producer.send({
            topic,
            messages: [{ value: JSON.stringify(message) }],
          });
          this.logger.debug(
            `Message send to topic ${topic}: ${JSON.stringify(message)}`,
            { ctx: KafkaProducer.name }
          );
        } catch (error) {
          this.logger.error(
            `Failed to send message to topic ${topic}: ${error.message}`,
            { ctx: KafkaProducer.name, error }
          );
          throw error;
        }
      }
    );
  }
}
