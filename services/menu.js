// services/menu.js

const foodMenus = [
    'ข้าวผัด',
    'ผัดกะเพรา',
    'ต้มยำกุ้ง',
    'ส้มตำ',
    'ข้าวมันไก่',
    'ก๋วยเตี๋ยวเรือ',
    'ข้าวหมูแดง',
    'ข้าวขาหมู',
    'ผัดไทย',
    'แกงเขียวหวานไก่',
    'ข้าวไข่เจียว',
    'ข้าวต้มปลา',
    'ข้าวหน้าเป็ด',
    'ข้าวซอย',
    'หมูกรอบผัดพริกเกลือ',
];

function getRandomMenu() {
    const randomMenu = foodMenus[Math.floor(Math.random() * foodMenus.length)];
    return `เมนูแนะนำวันนี้: ${randomMenu}`;
}

module.exports = { foodMenus, getRandomMenu };
