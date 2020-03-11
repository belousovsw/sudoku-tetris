let sudokuTetris = null;




document.addEventListener('DOMContentLoaded', function() {

	new Vue({
		el: '#t',
		mounted() {
			this.$el.className += 'a';
		}
	});

	sudokuTetris = new Vue({

		el: '#sudokuTetris',

		data: {
			score: 0,
			gameBoard: [],
			gameBoardLength: 3,
			gameBoardVirtual: [],
			maxFigures: 4,
			figures: [],
			dragging: {
				elementIndex: undefined,
				inGameBoard: { x: undefined, y: undefined },
				wasInGameBoard: false,
				staringCoordinates: { left: 0, top: 0 },
				currentCoordinates: { left: 10000, top: 10000 },
				dragByElement: { x: undefined, y: undefined },
				wrongPosition: true,
			}
		},

		computed: {

			gameBoardDraw() {
				this.gameBoardVirtual = [];
				this.dragging.inGameBoard = { x: undefined, y: undefined };
				for (let y = 0; y <= this.gameBoardLength - 1; y++) {
					this.gameBoardVirtual.push([]);
					for (let x = 0; x <= this.gameBoardLength - 1; x++) {
						this.gameBoardVirtual[y].push(this.gameBoard[y][x]);
					}
				}

				let startedFieldFind = false;
				let startedField = {x: 0, y: 0};
				for (let y = 0; y <= this.gameBoardLength - 1; y++) {
					for (let x = 0; x <= this.gameBoardLength - 1; x++) {
						let td = document.getElementById(`gameBoardField_${x}_${y}`);
						if (td === null || td === undefined) {
							continue;
						}
						let tdRect = td.getBoundingClientRect();
						if (   tdRect.left   + ((tdRect.left - tdRect.right) / 2) <= this.dragging.currentCoordinates.left
							&& tdRect.right  + ((tdRect.left - tdRect.right) / 2) >= this.dragging.currentCoordinates.left
							&& tdRect.top 	 + ((tdRect.top - tdRect.bottom) / 2) <= this.dragging.currentCoordinates.top
							&& tdRect.bottom + ((tdRect.top - tdRect.bottom) / 2) >= this.dragging.currentCoordinates.top ) {
							startedField = {x: x, y: y};
							this.dragging.inGameBoard = startedField;
							startedFieldFind = true;
							break;
						}
					}
					if (startedFieldFind) {
						break;
					}
				}
				let figure = this.figures[this.dragging.elementIndex];
				this.dragging.wrongPosition = false;
				let inGameBoard = false;
				if (figure !== undefined && startedFieldFind) {
					for (let y = 0; y < figure.length; y++) {
						for (let x = 0; x < figure[y].length; x++) {
							let ay = y + startedField.y;
							let ax = x + startedField.x;
							if (ax < 0 || ax > this.gameBoardLength - 1 || ay < 0 || ay > this.gameBoardLength - 1) {
								this.dragging.wrongPosition = true;
								if (figure[y][x] !== 0) {
									this.figures[this.dragging.elementIndex][y][x] = 2;
								}
								continue;
							}

							if (figure[y][x] !== 0) {
								if (this.gameBoard[ay][ax] == 1) {
									inGameBoard = true;
									this.dragging.wasInGameBoard = true;
									this.dragging.wrongPosition = true;
									this.gameBoardVirtual[ay][ax] = 1;
									this.figures[this.dragging.elementIndex][y][x] = 2;
								} else {
									inGameBoard = true;
									this.dragging.wasInGameBoard = true;
									this.figures[this.dragging.elementIndex][y][x] = 1;
									this.gameBoardVirtual[ay][ax] = 1;
								}
							} else {
								//this.gameBoardVirtual[ay][ax] = '';
							}
						}
					}
				}

				if (!this.dragging.wrongPosition && !inGameBoard ) {
					this.dragging.wrongPosition = true;
				}
				if (this.dragging.wasInGameBoard && !inGameBoard) {
					let figure = this.figures[this.dragging.elementIndex];
					for (let y = 0; y < figure.length; ++y) {
						for (let x = 0; x < figure[y].length; ++x) {
							if (figure[y][x] === 1) {
								figure[y][x] = 2;
							}
						}
					}
				}
				return this.gameBoardVirtual;
			},

		},


		methods: {
			updateFigures() {
				for (let i = this.figures.length; i < this.maxFigures; ++i) {
					this.figures.push(this.generateFigure());
				}
			},

			generateFigure() {
				let figureTemplate = [
					// standart tetris figure
					[ [1],[1],[1],[1] ],
					[ [1,0],[1,1],[1,0] ],
					[ [1,1],[1,0],[1,0] ],
					[ [1,1],[0,1],[0,1] ],
					[ [1,0],[1,1],[0,1] ],
					[ [0,1],[1,1],[1,0] ],
					[ [1,1],[1,1] ],
					[ [1] ],

					// [ [0,0,1],[0,0,1],[1,1,1] ],
					// [ [1,0,1],[0,1,0],[1,0,1] ],
					// [ [1,0,0],[0,1,0],[0,0,1] ],
					// [ [0,1,0],[1,0,1] ],
					// [ [1,1,1] ],
					// [ [1] ],
				];
				let selectedFigure = figureTemplate[Math.floor(Math.random() * Math.floor(figureTemplate.length))];
				return this.rotateFigure(Math.random()*5+1, selectedFigure);
			},

			rotateFigure(count, figure) {
				let selectedFigureRotated = [];
				// random rotate figure
				for (let i = 1; i <= count; ++i) {
					selectedFigureRotated = [];
					for (let y = 0; y < figure[0].length; ++y) {
						selectedFigureRotated.push([]);
						for (let x = 0; x < figure.length; ++x) {
							selectedFigureRotated[y].push([]);
						}
					}
					for (let y = 0; y < figure.length; ++y) {
						for (let x = 0; x < figure[y].length; ++x) {
							selectedFigureRotated[x][figure.length - y - 1] = figure[y][x];
						}
					}
					figure = _.clone(selectedFigureRotated);
				}
				return selectedFigureRotated;
			},

			checkMove() {

			},

			onMouseDown(i, gragByX, dragByY, e) {
				let this_ = this;
				let ball = e.target.parentElement.parentElement.parentElement;

				let coords = this.getCoords(ball);
				this_.dragging.elementIndex = i;
				this_.dragging.dragByElement.x = gragByX;
				this_.dragging.dragByElement.y = dragByY;
				this_.dragging.staringCoordinates = _.clone(coords);
				this_.dragging.currentCoordinates = _.clone(coords);

				let shiftX = e.pageX - coords.left;
				let shiftY = e.pageY - coords.top;

				ball.style.position = 'absolute';
				document.body.appendChild(ball);
				moveAt(e);

				function moveAt(e) {
					ball.style.left = e.pageX - shiftX + 'px';
					ball.style.top = e.pageY - shiftY + 'px';
					this_.dragging.currentCoordinates.left = e.pageX - shiftX;
					this_.dragging.currentCoordinates.top  = e.pageY - shiftY;
				}

				document.onmousemove = function(e) {
					moveAt(e);
				};

				ball.onmouseup = function() {
					document.onmousemove = null;
					ball.onmouseup = null;

					// Move virtual board in real bord if all ok
					if (!this_.dragging.wrongPosition) {
						this_.gameBoard = [];
						for (let y = 0; y <= this_.gameBoardLength - 1; y++) {
							this_.gameBoard.push([]);
							for (let x = 0; x <= this_.gameBoardLength - 1; x++) {
								this_.gameBoard[y].push(this_.gameBoardVirtual[y][x]);
							}
						}

						// Delete moved figure and add new
						this_.figures.splice(i, 1);
						this_.updateFigures();

						this_.checkRowsAndSquare();
					} else {
						let figure = this_.figures[i];
						for (let y = 0; y < figure.length; ++y) {
							for (let x = 0; x < figure[y].length; ++x) {
								if (figure[y][x] === 2) {
									figure[y][x] = 1;
								}
							}
						}
						if (!this_.dragging.wasInGameBoard) {
							this_.figures[i] = this_.rotateFigure(1, figure);
						}
					}
					ball = e.target.parentElement.parentElement.parentElement;
					ball.style.left  = this_.dragging.staringCoordinates.left + 'px';
					ball.style.top = this_.dragging.staringCoordinates.top + 'px';
					this_.dragging.currentCoordinates.left = 100000;
					this_.dragging.currentCoordinates.top  = 100000;
					this_.dragging.elementIndex  = undefined;
					this_.dragging.wasInGameBoard = false;
				};
			},

			checkRowsAndSquare() {
				// Run search fully rows, cols and square for clear
				// todo : if one time vertical row  | horisontal row | square, only one removed
				//let trySquare = [[1,1,1],[1,1,1],[1,1,1]];
				let trySquare = [];
				for (let y = 0; y < this.gameBoardLength / 3; y++) {
					trySquare.push([]);
					for (let x = 0; x < this.gameBoardLength / 3; x++) {
						trySquare[y].push(1);
					}
				}
				let fieldToClear = [];
				let virtScore = 0;
				for (let y = 0; y <= this.gameBoardLength - 1; y++) {
					let testRow = true;
					let testCol = true;
					let y3 = Math.floor(y/3);
					for (let x = 0; x <= this.gameBoardLength - 1; x++) {
						// Check row
						if (testRow === true && this.gameBoard[y][x] !== 1) {
							testRow = false;
						}
						// Check col
						if (testCol === true && this.gameBoard[x][y] !== 1) {
							testCol = false;
						}
						// Check square
						let x3 = Math.floor(x/3);
						if (trySquare[y3][x3] !== 0 && this.gameBoard[x][y] !== 1) {
							trySquare[y3][x3] = trySquare[y3][x3] * this.gameBoard[x][y];
						}
					}
					if (testRow) {
						virtScore += 1;
						for (let x = 0; x <= this.gameBoardLength - 1; x++) {
							fieldToClear.push([y, x]);
						}
					}
					if (testCol) {
						virtScore += 1;
						for (let x = 0; x <= this.gameBoardLength - 1; x++) {
							fieldToClear.push([x, y]);
						}
					}
				}
				for (let fc in fieldToClear) {
					this.gameBoard[fieldToClear[fc][0]][fieldToClear[fc][1]] = '';
				}

				// Check square
				for (let y = 0; y < trySquare.length; y++) {
					for (let x = 0; x < trySquare[y].length; x++) {
						if (trySquare[y][x] === 1) {
							virtScore += 1;
						}
					}
				}

				for (let y = 0; y <= this.gameBoardLength - 1; y++) {
					let y3 = Math.floor(y/3);
					for (let x = 0; x <= this.gameBoardLength - 1; x++) {
						let x3 = Math.floor(x/3);
						if (trySquare[y3][x3] === 1) {
							this.gameBoard[x][y] = '';
						}
					}
				}

				this.score += virtScore * virtScore;


			},

			getCoords(elem) {
				let box = elem.getBoundingClientRect();
				return {
					top: box.top + window.pageYOffset,
					left: box.left + window.pageXOffset
				};
			},

			newGame() {
				this.gameBoardLength = 3;
				this.gameBoardLength = this.gameBoardLength * 3;
				this.gameBoard = [];
				this.figures = [];
				this.score = 0;
				for ( let y = 0; y <= this.gameBoardLength - 1; ++y ) {
					this.gameBoard.push([]);
					for ( let x = 0; x <= this.gameBoardLength - 1; ++x ) {
						this.gameBoard[y].push();
					}
				}
				this.updateFigures();
			},

		},

		created() {
			this.newGame();
			console.info(`SudokuTetris: Game started successful.`);
		},

		beforeCreate() {
			console.info(`SudokuTetris: Hello! I'm ready to start.`);
		},

	});
});


