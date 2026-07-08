import { ServerStatusEnum } from "~/Enum/ServerStatusEnum";

export default interface ServerStatusInterface {
  shortName: string;
  displayName: string;
  status: ServerStatusEnum;
  version: string;
  mapUnavailableReason: string|null;
}
