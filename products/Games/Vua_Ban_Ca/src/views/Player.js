
(function(){

	var ns = Q.use("fish"), game = ns.game;
	
	var Player = ns.Player = function(props)
	{
		this.id = null;
		this.coin = 0;
		this.numCapturedFishes = 0;
		
		this.cannon = null;
		this.cannonMinus = null;
		this.cannonPlus = null;
		this.coinNum = null;
		
		props = props || {};
		Q.merge(this, props, true);
		
		this.init();
	};
	
	Player.prototype.init = function()
	{
   	 	this.extraBullets = 0; // Số viên đạn thêm (mặc định là 0)
   	 	this.fireRateMultiplier = 1; // Hệ số tốc độ bắn (mặc định là 1)

		var me = this, power = 1;
		
		this.cannon = new ns.Cannon(ns.R.cannonTypes[power]);
		this.cannon.id = "cannon";
		this.cannon.x = game.bottom.x + 425;
		this.cannon.y = game.bottom.y + 60;
		this.cannon.y = game.height - 10;
		
		this.cannonMinus = new Q.Button(ns.R.cannonMinus);
		this.cannonMinus.id = "cannonMinus";
		this.cannonMinus.x = game.bottom.x + 340;
		this.cannonMinus.y = game.bottom.y + 36;
		this.cannonMinus.onEvent = function(e)
		{
			if(e.type == game.events[1])
			{
				me.cannon.setPower(-1, true);
			}
		};
		
		this.cannonPlus = new Q.Button(ns.R.cannonPlus);
		this.cannonPlus.id = "cannonPlus";
		this.cannonPlus.x = this.cannonMinus.x + 140;
		this.cannonPlus.y = this.cannonMinus.y;
		this.cannonPlus.onEvent = function(e)
		{
			if(e.type == game.events[1])
			{
				me.cannon.setPower(1, true);
			}
		};
		
		this.coinNum = new ns.Num({id:"coinNum", src:ns.R.numBlack, max:6, gap:3, autoAddZero:true});
		this.coinNum.x = game.bottom.x + 20;
		this.coinNum.y = game.bottom.y + 44;
		this.updateCoin(this.coin);
		
		game.stage.addChild(this.cannon, this.cannonMinus, this.cannonPlus, this.coinNum);
	};
	
	Player.prototype.fire = function(targetPoint) {    
		var cannon = this.cannon, power = cannon.power, speed = 7;
	
		// Lấy số viên đạn dựa trên nâng cấp (1, 3 hoặc 5)
		var numBullets = 1 + (this.extraBullets || 0);  
		var totalCost = power * numBullets; // Trừ vàng tương ứng
	
		console.log("🎯 Số đạn hiện tại:", numBullets); // Debug để kiểm tra
	
		if (this.coin < totalCost) {
			console.log("⚠ Không đủ vàng để bắn!");
			return;
		}
	
		// Phát âm thanh bắn súng
		var fireSound = new Audio("/NguyenNgocSon/products/Games/Vua_Ban_Ca/sounds/fire.mp3");
		fireSound.volume = 0.2;
		fireSound.play();
	
		// Tính toán hướng bắn
		var baseDir = ns.Utils.calcDirection(cannon, targetPoint);
		var baseDegree = baseDir.degree;
	
		// Điều chỉnh góc bắn
		if (baseDegree == -90) baseDegree = 0;
		else if (baseDegree < 0 && baseDegree > -90) baseDegree = -baseDegree;
		else if (baseDegree >= 180 && baseDegree <= 270) baseDegree = 180 - baseDegree;
	
		cannon.fire(baseDegree);
	
		// Tạo góc lệch cho đạn
		var angleOffset = 10; // Mỗi viên đạn cách nhau 10 độ
		var angles = [];
		for (var i = 0; i < numBullets; i++) {
			var offset = (i - (numBullets - 1) / 2) * angleOffset;
			angles.push(baseDegree + offset);
		}
	
		// Bắn nhiều viên đạn
		for (var i = 0; i < angles.length; i++) {
			var degree = angles[i]; 
			var radian = degree * Q.DEG_TO_RAD;
			var sin = Math.sin(radian);
			var cos = Math.cos(radian);
	
			var bullet = new ns.Bullet(ns.R.bullets[power - 1]);
			bullet.x = cannon.x + (cannon.regY + 20) * sin;
			bullet.y = cannon.y - (cannon.regY + 20) * cos;
			bullet.rotation = degree;
			bullet.power = power;
			bullet.speedX = speed * sin;
			bullet.speedY = speed * cos;
	
			game.stage.addChild(bullet);
		}
	
		// Trừ số vàng đúng với số lượng đạn bắn ra
		this.updateCoin(-totalCost, true);
	};
	
	
	
	
	// Player.prototype.captureFish = function(fish)
	// {
	// 	this.updateCoin(fish.coin, true); // Không nhân giá trị cá với sức mạnh súng
	// 	this.numCapturedFishes++;
	// };
	
	Player.prototype.captureFish = function(fish)
	{
		var totalCoin = fish.coin * this.cannon.power; // Nhân giá trị cá với sức mạnh súng
		this.updateCoin(totalCoin, true);
		this.numCapturedFishes++;
	
		// Phát âm thanh thu hoạch cá
		var catchSound = new Audio("/NguyenNgocSon/products/Games/Vua_Ban_Ca/sounds/catch.mp3");
		catchSound.volume = 0.5; // Giảm âm lượng xuống 50%
		catchSound.play();
	};
	
	Player.prototype.updateCoin = function(coin, increase)
	{
		if(increase) this.coin += coin;
		else this.coin = coin;
		if(this.coin > 999999) this.coin = 999999;
		this.coinNum.setValue(this.coin);
	};
	
	Player.prototype.startCoinIncrement = function() {
		var me = this;
		setInterval(function() {
			me.updateCoin(1, true); // Cộng thêm 1 coin mỗi giây
		}, 1000);
	};
	
	
	})();