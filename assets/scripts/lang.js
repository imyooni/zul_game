import * as SaveGame from './SaveGame.js';

let languages = ['eng','kor']

export function Text(key){
   let list = {
    newGame: ["New Game", "새 게임"],
    continue: ["Continue", "계속하기"],
    options: ["Options", "옵션"],
    loading: ["Loading", "로딩 중"],
    exit: ["Exit", "종료"],
    bgm: ["Music", "음악"],
    sfx: ["Sound Effects", "효과음"],
   } 
  return list[key][languages.indexOf(SaveGame.loadGameValue('language'))] 
} 