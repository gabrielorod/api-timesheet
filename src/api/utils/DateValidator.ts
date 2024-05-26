import { format, formatInTimeZone } from 'date-fns-tz';
import { parseISO } from 'date-fns';

export class DateValidator {
  private static getFnsTmz(date: any): string {
    return formatInTimeZone(date, 'America/Sao_Paulo', 'yyyy-MM-dd HH:mm:ss.SSS');
  }

  public static timestampNumber(date: Date): string {
    return format(parseISO(this.getFnsTmz(date)), 'yyyyMMddHHmmssSSS');
  }

  public static dateToStrBR(date: Date): string {
    return format(date, 'dd/MM/yyyy');
  }
}
