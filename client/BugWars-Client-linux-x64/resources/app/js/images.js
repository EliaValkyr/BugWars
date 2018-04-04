var fs = require('fs');
var path = require('path');

Images = function() {
  this.r_dir = 'resources/';
  this.default_images_file = "defaults/images.txt";
  if (!fs.existsSync('defaults')) fs.mkdirSync('defaults');
  this.active_images = null;
  this.u_dir = null;
  this.bee2 = new Image();
  this.bee1 = new Image();
  this.spider2 = new Image();
  this.spider1 = new Image();
  this.beetle2 = new Image();
  this.beetle1 = new Image();
  this.ant2 = new Image();
  this.ant1 = new Image();
  this.queen2 = new Image();
  this.queen1 = new Image();
  this.wall = new Image();
  this.food = new Image();
  this.erase = new Image();
  this.ground = new Image();
}

Images.prototype.changeUnitsDir = function(name) {
  if (this.active_images == name) return;
  this.active_images = name;
  fs.writeFile(this.default_images_file, this.active_images, (err) => {
    if (err) {
      console.log(err);
      return;
    }
  });
  this.u_dir = this.r_dir + 'units_' + this.active_images + '/';
};

Images.prototype.load = function(callback=null) {
  var self = this;
  self.bee2.onload    = function() {
    if (callback != null) callback();
  };
  self.bee1.onload    = function() { self.bee2.src    = self.u_dir + 'bee2.png'; };
  self.spider2.onload = function() { self.bee1.src    = self.u_dir + 'bee1.png'; };
  self.spider1.onload = function() { self.spider2.src = self.u_dir + 'spider2.png'; };
  self.beetle2.onload = function() { self.spider1.src = self.u_dir + 'spider1.png'; };
  self.beetle1.onload = function() { self.beetle2.src = self.u_dir + 'beetle2.png'; };
  self.ant2.onload    = function() { self.beetle1.src = self.u_dir + 'beetle1.png'; };
  self.ant1.onload    = function() { self.ant2.src    = self.u_dir + 'ant2.png'; };
  self.queen2.onload  = function() { self.ant1.src    = self.u_dir + 'ant1.png'; };
  self.queen1.onload  = function() { self.queen2.src  = self.u_dir + 'queen2.png'; };
  self.wall.onload    = function() { self.queen1.src  = self.u_dir + 'queen1.png'; };
  self.food.onload    = function() { self.wall.src    = self.r_dir + 'wall.png'; };
  self.erase.onload   = function() { self.food.src    = self.r_dir + 'food.png'; };
  self.ground.onload  = function() { self.erase.src   = self.r_dir + 'erase.png'; };
  fs.exists(self.default_images_file, function(exists) {
    if (exists) {
      fs.readFile(self.default_images_file, 'utf-8', (err, data) => {
        if (err) {
          console.log(err);
          return;
        }
        if (data != "") {
          self.active_images = data;
          self.u_dir = self.r_dir + 'units_' + self.active_images + '/';
          self.ground.src = self.r_dir + 'ground.png';
        }
      });
    } else {
      self.active_images = 'drawings';
      self.u_dir = self.r_dir + 'units_' + self.active_images + '/';
      self.ground.src = self.r_dir + 'ground.png';
    }
  });
};

Images.prototype.get = function(name) {
  if (name == 'ground') return this.ground;
  if (name == 'wall') return this.wall;
  if (name == 'food') return this.food;
  if (name == 'queen1') return this.queen1;
  if (name == 'queen2') return this.queen2;
  if (name == 'ant1') return this.ant1;
  if (name == 'ant2') return this.ant2;
  if (name == 'beetle1') return this.beetle1;
  if (name == 'beetle2') return this.beetle2;
  if (name == 'spider1') return this.spider1;
  if (name == 'spider2') return this.spider2;
  if (name == 'bee1') return this.bee1;
  if (name == 'bee2') return this.bee2;
  if (name == 'erase') return this.erase;
};

Images.rmFilledDirSync = function(path) {
  if (fs.existsSync(path)) {
    fs.readdirSync(path).forEach(function(file, index) {
      var curPath = path + "/" + file;
      if(fs.lstatSync(curPath).isDirectory()) {
        deleteFolderRecursive(curPath);
      } else {
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(path);
  }
};

Images.copyFileSync = function(source, target) {
  var targetFile = target;
  //if target is a directory a new file with the same name will be created
  if (fs.existsSync(target)) {
    if (fs.lstatSync(target).isDirectory()) {
      targetFile = path.join(target, path.basename(source));
    }
  }
  fs.writeFileSync(targetFile, fs.readFileSync(source));
};

Images.copyFolderRecursiveSync = function(source, target) {
  var files = [];
  //check if folder needs to be created or integrated
  var targetFolder = target;
  if (!fs.existsSync(targetFolder)) {
    fs.mkdirSync(targetFolder);
  }
  //copy
  if (fs.lstatSync(source).isDirectory()) {
    files = fs.readdirSync(source);
    files.forEach(function (file) {
      var curSource = path.join(source, file);
      if (fs.lstatSync(curSource).isDirectory()) {
        Images.copyFolderRecursiveSync(curSource, targetFolder);
      } else {
        Images.copyFileSync(curSource, targetFolder);
      }
    });
  }
}

Images.prototype.updateImages = function() {
  var units = ['queen', 'ant', 'beetle', 'spider', 'bee'];
  for (var i = 0; i < units.length; i++) {
    var name = this.u_dir + units[i]
    $('#mapeditor-' + units[i] + '1-img').attr('src', name + '1.png?' + Math.random());
    $('#mapeditor-' + units[i] + '2-img').attr('src', name + '2.png?' + Math.random());
    $('#viewer-' + units[i] + '1-img').attr('src', name + '1.png?' + Math.random());
    $('#viewer-' + units[i] + '2-img').attr('src', name + '2.png?' + Math.random());
  }
}

Images.prototype.changeImagesWrapper = function(name, callback=null) {
  var self = this;
	var func = function() {
    $('#palette-drawings').css('background-color', '');
    $('#palette-circles').css('background-color', '');
    $('#palette-' + name).css('background-color', 'rgba(155, 193, 80, 1)');
    //Images.rmFilledDirSync("resources/units");
    //Images.copyFolderRecursiveSync("resources/units_" + name, "resources/units");
    self.changeUnitsDir(name);
    self.updateImages();
    self.load(callback);
	}
	return func;
};

exports.Images = Images;
