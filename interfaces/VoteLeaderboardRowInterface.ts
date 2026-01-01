export default interface VoteLeaderboardRowInterface {
  votes: number;
  uuid: string;
  name: string;
  displayName: string | null;
  started: number;
  expires: number;
}
