'use strict';

const os = require('os');

exports.generateAppleScript = dir => {
  const terminalCommand = `tell application "Terminal"
    do script "cd ${dir}"  in front window
  end tell`.split('\n').map(line => (` -e '${line.trim()}'`)).join('');

  const iTermCommand = `tell application "iTerm"
    tell current session of current window
      write text "cd ${dir}"
    end tell
  end tell`.split('\n').map(line => (` -e '${line.trim()}'`)).join('');

  const currentApp = `tell application "System Events"
    set activeApp to name of first application process whose frontmost is true
  end tell`.split('\n').map(line => (` -e '${line.trim()}'`)).join('');

  return `[ \`osascript ${currentApp}\` = "Terminal" ] && osascript ${terminalCommand} >/dev/null || osascript ${iTermCommand}`;
};


function winPathToLinux(path) {
  // 替换 Windows 磁盘标识为 Linux 形式
  path = path.replace(/^[A-Z]:/i, m => `/${m[0].toLowerCase()}`);
  // 将 \ 替换为 /
  return path.replace(/\\/g, '/');
}

exports.generateChangeDirectory = targetPath => {
  if (os.platform() === 'win32') {
    if (process.env.SHELL) {
      return `cd ${winPathToLinux(targetPath)}`;
    }
    const disk = targetPath.split(':').reverse().pop();
    return `${disk}: && cd ${targetPath}`;
  }
  return `cd ${targetPath}`;
};
