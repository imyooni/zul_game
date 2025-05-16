export function saveGameValue(key, value) {
    const saveData = JSON.parse(localStorage.getItem('SaveFile')) || {};
    saveData[key] = value;
    localStorage.setItem('SaveFile', JSON.stringify(saveData));
}
export function loadGameValue(key) {
    const saveData = JSON.parse(localStorage.getItem('SaveFile')) || {};
    return saveData[key];
} 
