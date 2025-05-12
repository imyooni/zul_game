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
    concert: ["Zulja's Concert", "줄자의 콘서트"],
    basic: ["Basic","기본"],
    bronze: ["Bronze","브론즈"],
    silver: ["Silver","실버"],
    gold: ["Gold","골드"],
    platinum: ["Platinum","플래티넘"],
    diamond: ["Diamond","다이아몬드"],
   } 
  return list[key][languages.indexOf(SaveGame.loadGameValue('language'))] 
} 