export const COMMANDS = {
  GREETING: 'hello nox',
  STOP: 'stop',
  HELP: 'help'
};

export function parseCommand(text) {
  const command = text.toLowerCase().trim();
  
  if (command.includes(COMMANDS.GREETING)) {
    return { type: 'GREETING' };
  }
  if (command.includes(COMMANDS.STOP)) {
    return { type: 'STOP' };
  }
  if (command.includes(COMMANDS.HELP)) {
    return { type: 'HELP' };
  }
  
  return { type: 'UNKNOWN' };
}