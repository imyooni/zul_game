import * as SaveGame from './SaveGame.js';

let languages = ['eng','kor','esp']

export function Text(key){
   let list = {
    newGame: ["New Game", "새 게임","Nueva Partida"],
    continue: ["Continue", "계속하기", "Continuar"],
    options: ["Options", "옵션", "Opciones"],
    loading: ["Loading", "로딩 중", "Cargando"],
    exit: ["Exit", "종료", "Salir"],
    bgm: ["Music", "음악", "Musica"],
    sfx: ["Sound Effects", "효과음", "Effectos De Sonido"],
    concert: ["Zulja's Concert", "줄자의 콘서트", "Concierto De Zulja"],
    basic: ["Basic", "기본", "Basico"],
    bronze: ["Bronze", "브론즈", "Bronce"],
    silver: ["Silver", "실버", "Plata"],
    gold: ["Gold", "골드", "Oro"],
    platinum: ["Platinum", "플래티넘", "Platino"],
    diamond: ["Diamond", "다이아몬드", "Diamante"],
    day: ["Day", "일", "Dia"],
   } 
  return list[key][languages.indexOf(SaveGame.loadGameValue('language'))] 
} 