var ws_scheme = window.location.protocol == "https:" ? "wss" : "ws";
const ws_path = ws_scheme + '://' + window.location.host + "/game/" + {game_id};
console.log("Connecting to " + ws_path);
const socket = new ReconnectingWebSocket(ws_path);
var board = null
var game = new Chess()
var $status = $('#status')
var $fen = $('#fen')
var $pgn = $('#pgn')
var $modalTitle = $('#modal-title')
var $modalBody = $('#modal-body')
var orientation = null

var whiteSquareGrey = '#a9a9a9'
var blackSquareGrey = '#696969'


function removeGreySquares () {
  $('#myBoard .square-55d63').css('background', '')
}

function greySquare (square) {
  var $square = $('#myBoard .square-' + square)

  var background = whiteSquareGrey
  if ($square.hasClass('black-3c85d')) {
    background = blackSquareGrey
  }

  $square.css('background', background)
}

function onDragStart (source, piece, position, orientation) {
  if (game.game_over()) return false
  return !((orientation === 'white' && piece.search(/^w/) === -1) || (orientation === 'black' && piece.search(/^b/) === -1));
}

function onDrop (source, target) {
  var move = game.move({
    from: source,
    to: target,
    promotion: 'q'
  })
  if (move === null) return 'snapback'
  updateStatus()
  socket.send(JSON.stringify({"command": "new-move","source": source,"target": target,"fen": game.fen(), "pgn": game.pgn()}));
}

function onSnapEnd () {
  board.position(game.fen())
}

function onMouseoverSquare (square, piece) {
  if (!((orientation === 'white' && game.turn()==='w') || (orientation === 'black' && game.turn()==='b')))
    return

  var moves = game.moves({
    square: square,
    verbose: true
  })
  if (moves.length === 0) return
  greySquare(square)
  for (var i = 0; i < moves.length; i++) {
    greySquare(moves[i].to)
  }
}

function onMouseoutSquare (square, piece) {
  removeGreySquares()
}

function onSnapEnd () {
  board.position(game.fen())
}

function updateStatus () {
  var status = ''

  var moveColor = 'White'
  if (game.turn() === 'b') {
    moveColor = 'Black'
  }
  if (game.in_checkmate()) {
    status = 'Game over, ' + moveColor + ' is in checkmate.'
    if(moveColor === 'White')
      socket.send(JSON.stringify({"command": "game-over","result": "Black wins"}));
    else
      socket.send(JSON.stringify({"command": "game-over","result": "White wins"}));
    $modalTitle.html("Game Over")
    $modalBody.html(status)
    $('#gameModal').modal({
      keyboard: false,
      backdrop: 'static'
    }); 
  }
  else if (game.in_draw()) {
    status = 'Game over, drawn position'
    socket.send(JSON.stringify({"command": "game-over","result": "Game ended in drawn position"}));
    $modalTitle.html("Game Over")
    $modalBody.html(status)
    $('#gameModal').modal({
      keyboard: false,
      backdrop: 'static'
    });
  }
  else if (game.in_stalemate()) {
    status = 'Game over, stalemate'
    socket.send(JSON.stringify({"command": "game-over","result": "Game ended in stalemate"}));
    $modalTitle.html("Game Over")
    $modalBody.html(status)
    $('#gameModal').modal({
      keyboard: false,
      backdrop: 'static'
    });
  }
  else {
    status = moveColor + ' to move'
    if (game.in_check()) {
      status += ', ' + moveColor + ' is in check'
    }
  }

  $status.html(status)
  $fen.html(game.fen())
  $pgn.html(game.pgn())
}

updateStatus()

socket.onclose = function () {
  $modalTitle.html("Connection closed")
  $modalBody.html("Connection closed unexpectedly please wait while we try to reconnect...")
  $('#gameModal').modal({
   keyboard: false,
   backdrop: 'static'
  });
}

socket.onopen = function () {
  $('#gameModal').modal('hide');
  $('#gameModal').data('bs.modal',null);
}

socket.onmessage = function (message) {
  console.log("Got websocket message " + message.data);
  var data = JSON.parse(message.data);
  if (data.command=="join") {
    console.log("joining room as "+data.orientation)
    var config = {
    draggable: true,
    position: 'start',
    onDragStart: onDragStart,
    onDrop: onDrop,
    onSnapEnd: onSnapEnd,
    onMouseoutSquare: onMouseoutSquare,
    onMouseoverSquare: onMouseoverSquare,
    pieceTheme: '/static/chessboard/{piece}.png',
    orientation: data.orientation
    }
    board = Chessboard('myBoard', config)
    orientation=data.orientation;
    if(data.pgn){
      game.load_pgn(data.pgn)
    }
    board.position(game.fen());
    updateStatus();
    if(data.opp_online!=true) {
      $modalTitle.html("Please Wait...")
      $modalBody.html("Please wait for your opponent to connect to this game")
      $('#gameModal').modal({
        keyboard: false,
        backdrop: 'static'
      });
    }
  }
  else if(data.command=="opponent-online"){
    $('#gameModal').modal('hide');
    $('#gameModal').data('bs.modal',null);
  }
  else if(data.command=="opponent-offline"){
    $modalTitle.html("Please Wait...")
    $modalBody.html("Your opponent suddenly disconnected. Please wait for your opponent to connect to this game")
    $('#gameModal').modal({
      keyboard: false,
      backdrop: 'static'
    });
  }
  else if(data.command=="new-move") {
    game.move({
        from: data.source,
        to: data.target,
        promotion: 'q'
      });
    board.position(game.fen());
    updateStatus()
  }
  else if(data.command=="opponent-resigned") {
    $modalTitle.html("Game over")
    $modalBody.html("Your opponent has resigned from the game. You win!")
    $('#gameModal').modal({
      keyboard: false,
      backdrop: 'static'
    });
  }
}

$(document).on('click','#resign', function(){
  $('#resignModal').modal({
    keyboard: false,
    backdrop: 'static'
  });
})
$(document).on('click','#noRes', function(){
  $('#resignModal').modal('hide');
  $('#resignModal').data('bs.modal',null);
})
$(document).on('click','#yesRes', function(){
  if(orientation === 'white')
    socket.send(JSON.stringify({"command": "resign","result": "Black wins"}));
  else
    socket.send(JSON.stringify({"command": "resign","result": "White wins"}));
  $('#resignModal').modal('hide');
  $('#resignModal').data('bs.modal',null);
  $modalTitle.html("Game over")
  $modalBody.html("You have resigned from the game. You lose!")
  $('#gameModal').modal({
    keyboard: false,
    backdrop: 'static'
  });
})