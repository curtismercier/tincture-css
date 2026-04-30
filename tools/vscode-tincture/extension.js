// Stub — full implementation deferred.
const vscode = require('vscode');
function activate(ctx) {
  console.log('Tincture extension active. Full features in v0.2+.');
  ctx.subscriptions.push(
    vscode.commands.registerCommand('tincture.applyMood', () => {
      vscode.window.showInformationMessage('Tincture mood apply — implementation deferred');
    }),
  );
}
module.exports = { activate };
