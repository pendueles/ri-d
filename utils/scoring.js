// src/utils/scoring.js

export function calcBlockScore(block, answers) {
  let blockScore = 0;
  let totalSubcatWeight = 0;
  block.subcats.forEach(sub => { totalSubcatWeight += sub.subcatWeight; });
  block.subcats.forEach(sub => {
    let subcatRaw = 0;
    sub.items.forEach(item => {
      if (answers[item.id] === true) subcatRaw += item.w;
    });
    const subcatScore = subcatRaw;
    blockScore += (subcatScore * sub.subcatWeight) / totalSubcatWeight;
  });
  return Math.round(blockScore * 10) / 10;
}

export function calcTotalScore(blocks, answers) {
  let total = 0;
  blocks.forEach(block => {
    const bs = calcBlockScore(block, answers);
    total += bs * block.blockWeight;
  });
  return Math.round(total * 10) / 10;
}
