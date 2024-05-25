import { Controller, Get, HttpCode } from "@nestjs/common";
import { DateValidator } from "../../api/utils/DateValidator";
import packageJson from "../../../package.json";

@Controller()
export class ApiManifestController {
  @Get("/")
  @HttpCode(200)
  async handle() {
    return {
      timestamp: DateValidator.timestampNumber(new Date()),
      version: packageJson.version,
    };
  }
}
