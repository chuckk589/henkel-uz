import { EntityManager } from '@mikro-orm/core';
import { forwardRef, HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { Bot, InputFile } from 'grammy';
import { BOT_NAME } from 'src/constants';
import { BotContext } from 'src/types/interfaces';
import i18n from '../bot/middleware/i18n';
import { Winner } from '../mikroorm/entities/Winner';
import { UpdateWinnerDto } from './dto/update-winner.dto';
import QRCode from 'qrcode';
import { RetrieveWinnerDto } from '../lottery/dto/retrieve-lottery.dto';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

@Injectable()
export class WinnerService {
  constructor(
    private readonly em: EntityManager,
    @Inject(BOT_NAME) private bot: Bot<BotContext>,
    @InjectPinoLogger('WinnerService') private readonly logger: PinoLogger,
  ) {}
  async remove(id: number) {
    return await this.em.nativeDelete(Winner, { id });
  }
  async sendNotification(id: number) {
    const winner = await this.em.findOneOrFail(
      Winner,
      { id },
      { populate: ['check.user', 'lottery.prize', 'prize_value'] },
    );
    const message = i18n.t(winner.check.user.locale, winner.lottery.prize.name, { check_id: winner.check.fancyId });
    const barCode = await QRCode.toBuffer(winner.prize_value.qr_payload, {
      scale: 15,
    });
    //await this.bot.api.sendMessage(winner.check.user.chatId, message);
    if (winner.lottery.prize.name !== 'PRIZE_MAIN') {
      await this.bot.api
        .sendPhoto(winner.check.user.chatId, new InputFile(barCode), {
          caption: message,
        })
        .then(() => {
          this.logger.info(`Sent QR code to ${winner.check.user.id} qr_payload: ${winner.prize_value.qr_payload}`);
        })
        .catch((err) => {
          this.logger.error(
            `Error sending QR code to ${winner.check.user.id} qr_payload: ${winner.prize_value.qr_payload}`,
            err,
          );
        });
    } else {
      await this.bot.api
        .sendMessage(winner.check.user.chatId, message)
        .then(() => {
          this.logger.info(`Sent QR code to ${winner.check.user.id} qr_payload: ${winner.prize_value.qr_payload}`);
        })
        .catch((err) => {
          this.logger.error(
            `Error sending QR code to ${winner.check.user.id} qr_payload: ${winner.prize_value.qr_payload}`,
            err,
          );
        });
    }
    // await this.em.nativeUpdate(Winner, { id }, { notified: true });
  }
  async update(id: number, updateWinnerDto: UpdateWinnerDto) {
    const winner = await this.em.findOne(Winner, id, { populate: ['check.user'] });
    if (!winner.notified && updateWinnerDto.notified) {
      await this.sendNotification(id);
    }
    winner.confirmed = updateWinnerDto.confirmed;
    winner.notified = updateWinnerDto.notified;
    winner.primary = updateWinnerDto.primary;
    await this.em.persistAndFlush(winner);
    return new RetrieveWinnerDto(winner);
  }
}
