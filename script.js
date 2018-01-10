var mtlLoader;
var scene, camera, renderer;
var holepos;
var balls;
var mainball;
var board;
var queueCenter;
var movement;

const desceleration = 0.0001;
const ballabsorption = 0.9;
const wallabsorption = 0.001;
const hitForce = 0.05;
const anticlip = 0.01;
const holepermission = 0.08;
const ballray = 0.032;
const spacebar = 32;
const queueMargin = -0.3;

var WIDTH  = window.innerWidth;
var HEIGHT = window.innerHeight;

function init() {
    scene = new THREE.Scene();
	mtlLoader = new THREE.MTLLoader();

	movement = false;

	board = {
		topleft : {
			x : -1.70,
			y : 1.15
		},
		bottomright : {
			x : 2.75,
			y : -1.15
		}
	};

	holepos = [{
		x : -1.65,
		y : 1.15
	}, {
		x : -1.65,
		y : -1.15
	}, {
		x : 0.55,
		y : -1.15
	}, {
		x : 0.55,
		y : 1.15
	}, {
		x : 2.8,
		y : 1.15
	}, {
		x : 2.8,
		y : -1.15
	}];

	balls = [];
	balls.push(getBall(-0.7, 0.0));
	balls.push(getBall(-0.8, 0.05));
	balls.push(getBall(-0.8, -0.05));
	balls.push(getBall(-0.9, 0.1));
	balls.push(getBall(-0.9, 0.0));
	balls.push(getBall(-0.9, -0.1));
	balls.push(getBall(-1.0, 0.15));
	balls.push(getBall(-1.0, 0.05));
	balls.push(getBall(-1.0, -0.05));
	balls.push(getBall(-1.0, -0.15));
	mainball = getBall(2, 0);
	queueCenter = new THREE.Object3D();
	queueCenter.position.x = 2;
	queueCenter.position.y = 0.95;
	queueCenter.position.z = 0;
	queueCenter.rotation.z = 0.2;
	scene.add(queueCenter);

    initMesh();
    initCamera();
    initLights();
    initRenderer();

    document.body.appendChild(renderer.domElement);
	document.addEventListener("keydown", function (event) {
		// if(movement)
		// 	return;
	    var keyCode = event.which;
		if(keyCode == spacebar) {
			mainball.speed.x = -hitForce;
			scene.remove(queueCenter);
			movement = true;
		}
		else if(keyCode == 13){
			mainball.speed.x = -hitForce;
			mainball.speed.y = -hitForce;
			scene.remove(queueCenter);
			movement = true;
		}
	}, false);

}

function vectorAdd(vec1, vec2) {
	return {
		x : vec1.x + vec2.x,
		y : vec1.y + vec2.y
	};
}

function vectorSub(vec1, vec2) {
	return {
		x : vec1.x - vec2.x,
		y : vec1.y - vec2.y
	};
}

function vectorMult(vec, constant) {
	return {
		x : vec.x * constant,
		y : vec.y * constant
	};
}

function scalarProduct(vec1, vec2) {
	return (vec1.x * vec2.x) + (vec1.y * vec2.y);
}

function vectorNorm(vec) {
	return Math.sqrt((vec.x * vec.x) + (vec.y * vec.y));
}

function getBall(givenX = 0, givenY = 0) {
	return {
		speed : {
			x : 0,
			y : 0
		},
		pos : {
			x : givenX,
			y : givenY
		},
		nextspeed : undefined,
		//nextpos : undefined,
		renderObject : undefined,
		onBoard : true,
		justCollided : false
	};
}

function initCamera() {
    camera = new THREE.PerspectiveCamera(70, WIDTH / HEIGHT, 1, 100);
    camera.position.set(3, 3.5, 0);
	controls = new THREE.OrbitControls(camera);
    controls.update();
    camera.lookAt(scene.position);
}


function initRenderer() {
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(WIDTH, HEIGHT);
}

function initLights() {
    var light = new THREE.AmbientLight(0xffffff);
    scene.add(light);
}

function loadBall(ball, color) {
	mtlLoader.load('white_ball.mtl', function (materials) {
		materials.preload();
		materials.materials["Cue-ball"].color = color;
		var objLoader = new THREE.OBJLoader();
		objLoader.setMaterials(materials);
		//objLoader.setColor(color);
		objLoader.setPath('meshes/');
		objLoader.load('white_ball.obj', function (object) {
			if (object instanceof THREE.Object3D)
			{
				object.traverse (function (mesh)
				{
					if (!(mesh instanceof THREE.Mesh)) return;
					mesh.material.side = THREE.DoubleSide;
				});
				object.scale.x = object.scale.y = object.scale.z = 1;
				object.position.x = ball.pos.x;
				object.position.y = 0.95;
				object.position.z = ball.pos.y;

			}
			scene.add(object);
			ball.renderObject = object;
		}, undefined, undefined);
	});
}

var mesh = null;
function initMesh() {

	mtlLoader.setPath('meshes/');
	mtlLoader.load('pool_table.mtl', function (materials) {
	    materials.preload();
	    var objLoader = new THREE.OBJLoader();
	    objLoader.setMaterials(materials);
	    objLoader.setPath('meshes/');
	    objLoader.load('pool_table.obj', function (object) {
	    	if (object instanceof THREE.Object3D)
	        {
	            object.traverse (function (mesh)
	            {
	                if (!(mesh instanceof THREE.Mesh)) return;
	                mesh.material.side = THREE.DoubleSide;
	            });
				object.scale.x = object.scale.y = object.scale.z = 2;

	        }
	        scene.add(object);
	    }, undefined, undefined);
	});

	mtlLoader.setPath('meshes/');
	mtlLoader.load('queue.mtl', function (materials) {
		materials.preload();
		materials.materials.Cue.color = {
			r : 74,
			g : 35,
			b : 1
		};
		var objLoader = new THREE.OBJLoader();
		objLoader.setMaterials(materials);
		objLoader.setPath('meshes/');
		objLoader.load('queue.obj', function (object) {
			if (object instanceof THREE.Object3D)
			{
				object.traverse (function (mesh)
				{
					if (!(mesh instanceof THREE.Mesh)) return;
					mesh.material.side = THREE.DoubleSide;
				});
				object.scale.x = object.scale.y = object.scale.z = 0.1;
				object.position.x = 0;
				object.position.z = 0;
				object.position.y = 0;
				object.position.x += queueMargin;
			 	object.position.z -= 0.015;
				object.position.y = 1.1;
			}
			queueCenter.add(object);
			queue = object;
		}, undefined, undefined);
	});

	loadBall(mainball, {r : 256, g : 256, b : 256});
	balls.forEach(function(ball, i) {loadBall(ball, {r : 256, g : i % 2 == 0 ? 256 : 0, b : 0});});
}

function ballIsCollided(testBall, otherBall) {
	return Math.abs(testBall.pos.x - otherBall.pos.x) <= 2 * ballray && Math.abs(testBall.pos.y - otherBall.pos.y) <= 2 * ballray
}

function collideBalls(testBall, otherBall) {
	if(ballIsCollided(testBall, otherBall)) {
		testBall.currentlyCollided = true;
		var scalar = scalarProduct(vectorSub(testBall.speed, otherBall.speed), vectorSub(testBall.pos, otherBall.pos));
		var denom = vectorNorm(vectorSub(testBall.pos, otherBall.pos));
		denom *= denom;
		var product = vectorMult(vectorSub(testBall.pos, otherBall.pos), scalar / denom);
		var result = vectorMult(vectorSub(testBall.speed, product), ballabsorption);
		if(testBall.nextspeed == undefined)
			testBall.nextspeed = result;
		else
			testBall.nextspeed = vectorAdd(testBall.nextspeed, result);
		testBall.justCollided = true;
	}

		// if(testBall.pos.x > otherBall.pos.x)
		// 	testBall.pos.x += anticlip;
		// else
		// 	testBall.pos.x -= anticlip;
		// if(testBall.pos.y > other.pos.y)
		// 	testBall.pos.y += anticlip;
		// else
		// 	testBall.pos.y -= anticlip;
}

function collideWall(ball) {
	if(ball.pos.x - ballray <= board.topleft.x) {
		ball.speed.x = -ball.speed.x;
		ball.pos.x = board.topleft.x + ballray + anticlip;
	}
	else if(ball.pos.x + ballray >= board.bottomright.x) {
		ball.speed.x = -ball.speed.x;
		ball.pos.x = board.bottomright.x - ballray - anticlip;
	}
	if(ball.pos.y + ballray >= board.topleft.y) {
		ball.speed.y = -ball.speed.y;
		ball.pos.y = board.topleft.y - ballray - anticlip;
	}
	else if(ball.pos.y - ballray <= board.bottomright.y) {
		ball.speed.y = -ball.speed.y;
		ball.pos.y = board.bottomright.y + ballray + anticlip;
	}
}

function checkHoles(ball) {
	holepos.forEach(function(hole) {
		if(Math.abs(ball.pos.x - hole.x) < holepermission && Math.abs(ball.pos.y - hole.y) < holepermission) {
			ball.onBoard = false;
			ball.pos.x = 0;
			ball.pos.y = 0;
			ball.speed.x = 0;
			ball.speed.y = 0;
			scene.remove(ball.renderObject);
		}
	})
}

function applySpeed(ball) {
	if(ball.nextspeed != undefined) {
		ball.speed = ball.nextspeed;
		ball.nextspeed = undefined;
	}
	if((ball.speed.x > 0 && ball.speed.x < desceleration) || (ball.speed.x < 0 && ball.speed.x + desceleration >= 0))
		ball.speed.x = 0;
	else if(ball.speed.x > 0)
		ball.speed.x -= desceleration;
	else if(ball.speed.x < 0)
		ball.speed.x += desceleration;
	if((ball.speed.y > 0 && ball.speed.y < desceleration) || (ball.speed.y < 0 && ball.speed.y + desceleration >= 0))
		ball.speed.y = 0;
	else if(ball.speed.y > 0)
		ball.speed.y -= desceleration;
	else if(ball.speed.y < 0)
		ball.speed.y += desceleration;

	ball.pos.x += ball.speed.x;
	ball.pos.y += ball.speed.y;
	if(ball.justCollided) {
		ball.pos.x += Math.sign(ball.speed.x) * (anticlip / 5.0);
		ball.pos.y += Math.sign(ball.speed.y) * (anticlip / 5.0);
		ball.justCollided = false;
	}
}

function updatePositions() {
	applySpeed(mainball);
	balls.forEach(function(ball) {
		if(!ball.onBoard)
			return;
		applySpeed(ball);
		checkHoles(ball);
	});
	//ball.checkHoles(mainball);

}

function applyColisions() {
	collideWall(mainball);
	balls.forEach(function(ball, i) {
		if(!ball.onBoard)
			return;
		collideWall(ball);
		balls.forEach(function(otherBall, j) {
			if(i == j)
				return;
			collideBalls(ball, otherBall);
		});
		collideBalls(ball, mainball);
	});
	balls.forEach(function(ball) {
		if(!ball.onBoard)
			return;
		collideBalls(mainball, ball);
	});
}

function checkMovement() {
	if(mainball.speed.x != 0 || mainball.speed.y != 0)
		return true;
	check = false;
	balls.forEach(function(ball) {
		if(check)
			return;
		if(ball.speed.x != 0 || ball.speed.y != 0) {
			check = true;
		}
	});
	return check;
}

function updateScene() {
	mainball.renderObject.position.x = mainball.pos.x;
	mainball.renderObject.position.z = mainball.pos.y;
	balls.forEach(function(ball) {
		if(!ball.onBoard)
			return;
		ball.renderObject.position.x = ball.pos.x;
		ball.renderObject.position.z = ball.pos.y;
	})
}

function render() {
    requestAnimationFrame(render);
    renderer.render(scene, camera);
	applyColisions();
	updatePositions();
	updateScene();
	if(!checkMovement()) {
		movement = false;
	}
}

init();
render();
