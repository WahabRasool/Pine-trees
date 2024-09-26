import {
    Scene,
    Color,
    Container,
    Image,
    Position,
    NetworkEvent,
    Math as M
  } 
  from "https://unpkg.com/pencil.js/dist/pencil.esm.js";
  
  const { map, random } = M;
  const { floor, min } = Math;
  
  const baseColor = new Color("#020703");
  const topColor = new Color("#92935A");
  
  const maxTries = 100;
  const minRadius = 25;
  const maxRadius = 60;
  const minTreeHeight = 5;
  const maxTreeHeight = 10;
  const moveSpeed = 1;
  
  const canvas = document.createElement("canvas");
  const mult = 75;
  canvas.width = 16 * mult;
  canvas.height = 9 * mult;
  document.body.appendChild(canvas);
  
  const scene = new Scene(canvas);
  const { width, height } = scene;
  const bottomCenter = new Position(width / 2, height);
  
  const image = new Image(undefined, "https://i.ibb.co/7gNrVLr/leaf.png");
  
  class Tree extends Container {
    constructor(position, radius, stacks) {
      super(position);
      this.radius = radius;
  
      for (let i = 0; i < stacks; ++i) {
        this.add(
          new Image(undefined, image, {
            scale: map(i, 0, stacks, (radius / image.width) * 2, 0),
            tint: baseColor.clone().lerp(topColor, (i + 1) / stacks),
            origin: Image.origins.center,
            rotation: random()
          })
        );
      }
    }
  
    move() {
      this.children.forEach((stage, index) => {
        stage.position.set(
          30 * index * (this.position.x / width - 0.5),
          10 * index * (this.position.y / height - 1)
        );
      });
    }
  }
  
  function addTree(newPosition, trees) {
    const canGrow = min(
      ...trees.map(
        ({ position, radius }) => newPosition.distance(position) - radius + 10
      ),
      newPosition.y + minRadius,
      height - newPosition.y + maxRadius,
      maxRadius
    );
  
    if (canGrow > minRadius) {
      return new Tree(
        newPosition,
        canGrow,
        floor(random(minTreeHeight, maxTreeHeight))
      );
    }
  
    return null;
  }
  
  image.on(NetworkEvent.events.ready, () => {
    const trees = [];
    let fail = 0;
    while (fail < maxTries) {
      const tree = addTree(scene.getRandomPosition(), trees);
      if (tree) {
        trees.push(tree);
        fail = 0;
      } else {
        fail++;
      }
    }
  
    scene.add(...trees);
  });
  
  scene
    .startLoop()
    .on(Scene.events.draw, () => {
      scene.children.forEach((tree) => {
        if (tree.position.x - tree.radius > width) {
          tree.delete();
        } else {
          tree.position.add(moveSpeed, 0);
          tree.move();
          tree.options.zIndex = -tree.position.distance(bottomCenter);
        }
      });
  
      const tree = addTree(
        new Position(-maxRadius, random(height)),
        scene.children
      );
  
      if (tree) {
        scene.add(tree);
      }
    }, true);
  