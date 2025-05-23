function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('AgentBill')
    .addItem('Say Hello', 'sayHello')
    .addToUi();
}

function sayHello() {
  SpreadsheetApp.getUi().alert('Hello from AgentBill!');
}
