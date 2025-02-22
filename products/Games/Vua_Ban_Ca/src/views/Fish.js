
(function(){

var ns = Q.use("fish"), game = ns.game;

var Fish = ns.Fish = function(type)
{
	this.type = type;
	this.speed = 0.5;
	this.moving = true;
	this.canTurning = false;
	this.hasShown = false;
	this.captured = false;
	
	Fish.superClass.constructor.call(this, type);
	this.id = Q.UIDUtil.createUID("Fish");
};
Q.inherit(Fish, Q.MovieClip);

Fish.prototype.init = function(props)
{
	this.changeDirection(this.rotation);
};

Fish.prototype.setType = function(type)
{
	Q.merge(this, type, true);
	Q.merge(this, type.mixin, false);
	
	this.setDrawable(type.image);
	this._frames.length = 0;
	this.addFrame(type.frames);
	this.gotoAndPlay(0);
};

Fish.prototype.changeDirection = function(dir)
{
	if(dir != undefined)
	{
		this.setDirection(dir);
	}else
	{		
		var chance = Math.random() > 0.80;
	    if(chance)
	    {
	    	var dir = Math.random() > 0.5 ? 1 : -1;	    	
	    	var degree = Math.random()*10 + 20 >> 0;
	    	this._destRotation = this.rotation + degree * dir >> 0;
	    }
	}
	
	var fps = game.fps, min = fps * 5, max = fps * 10;
	this.changeDirCounter = Math.random()*(max - min + 1) + min >> 1;
};

Fish.prototype.setDirection = function(dir)
{
	if(this.rotation == dir && this.speedX != undefined) return;
	
	if(dir.degree == undefined)
	{
		var radian = dir * Q.DEG_TO_RAD;
		dir = {degree:dir, sin:Math.sin(radian), cos:Math.cos(radian)};		
	}
	
	this.rotation = dir.degree % 360;
	this.speedX = this.speed * dir.cos;
	this.speedY = this.speed * dir.sin;
};

// Fish.prototype.canBeCaptured = function(level)
// {
// 	return this.captureRate * (1 + level*0.05) > Math.random();
// 	//súng càng mạnh thì càng dễ bắt
// };

// Fish.prototype.canBeCaptured = function(level)
// {
//     return this.captureRate * (1 + (7 - level) * 0.05) > Math.random();
// 	//súng càng mạnh càng khó bắt
// };

Fish.prototype.canBeCaptured = function(level)
{
    var power = game.player.cannon.power;  

    // Tỷ lệ bắt cá dựa trên sức mạnh súng
    var captureRates = {
        1: 0.7,  // Giảm 30% so với xác suất gốc
        2: 0.6,  // Giảm 40% so với xác suất gốc
        3: 0.5,  // Giảm 50% so với xác suất gốc
        4: 0.4,  // Giảm 60% so với xác suất gốc
        5: 0.3,  // Giảm 70% so với xác suất gốc
        6: 0.2,  // Giảm 80% so với xác suất gốc
        7: 0.1   // Giảm 90% so với xác suất gốc
    };

    var chance = Math.max((this.captureRate || 0.3) * (captureRates[power] || 0.3), 0.01);


    return Math.random() < chance;
};


Fish.prototype.update = function()
{
    //be captured
    if(this.captured)
    {
    	if(--this.capturingCounter <= 0)
		{
			//coin animation
			var type = this.coin >= 10 ? ns.R.coinAni2 : ns.R.coinAni1;
			var coin = new Q.MovieClip(type);
			coin.x = this.x;
			coin.y = this.y;
			this.parent.addChild(coin);
			
			//coin count number
			var totalCoin = this.coin * game.player.cannon.power; // Nhân với sức mạnh súng
			var value = "+" + totalCoin.toString();
			var num = new ns.Num({id:"coinCount", src:ns.R.coinText, max:value.length, gap:3, scaleX:0.8, scaleY:0.8});
			num.x = this.x;
			num.y = this.y;
			num.setValue(value);
			this.parent.addChild(num);
			
			Q.Tween.to(num, {y:num.y - 50}, {time:800, onComplete:function(tween)
			{
				tween.target.parent.removeChild(tween.target);
			}});
			
			var tx = game.bottom.x + 100, ty = game.height;
			Q.Tween.to(coin, {x:tx, y:ty}, {time:800, onComplete:function(tween)
			{
				tween.target.parent.removeChild(tween.target);
			}});
			
			//remove the fish to fish pool
			this.parent.removeChild(this);
			game.player.captureFish(this);
			game.fishManager.fishPool.push(this);
		}
    	return;
    }
    
    //move ahead
    if(this.moving)
    {
    	this.x += this.speedX;
		this.y += this.speedY;
    }
    
    //change direction
    if(this._destRotation != null)
    {
    	var delta = this._destRotation - this.rotation;    	
    	var step = 0.1, realStep = delta > 0 ? step : -step;
    	var r = this.rotation + realStep;
    	
    	if(delta == 0 ||
    	   (realStep > 0 && r >= this._destRotation) || 
    	   (realStep < 0 && r <= this._destRotation))
    	{
    		this.setDirection(this._destRotation);
    		this._destRotation = null;
    	}else
    	{
    		this.setDirection(r);
    	}
    }else if(--this.changeDirCounter <= 0 && this.canTurning)
    {
    	this.changeDirection();
    }  
};

Fish.prototype.isOutOfScreen = function()
{
	if(this.x < -this.width ||
	   this.x > game.width + this.width ||
	   this.y < -this.height ||
	   this.y > game.height + this.height)
	{
		return true;
	}else if(this.x > 100 && this.x < game.width - 100 && this.y > 100 && this.y < game.height - 100)
	{
		this.canTurning = true;
	}
	return false;
};

})();