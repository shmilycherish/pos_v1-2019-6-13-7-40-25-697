'use strict';

const allItems = loadAllItems();
const promotion = loadPromotions();

function printReceipt(inputs) {
  const items = parseItem(inputs);
  const itemDetails = generateItemDetails(items);
  const receipt = generateReceiptTemplate(generateReciptBody(itemDetails), getTotalCost(itemDetails), getMinusCost(itemDetails));
  console.log(receipt);
}

function parseItem(inputs) {
    return inputs.map(item => {
        const itemInfo = item.split('-');
        if(itemInfo.length > 1) {
            return {barcode: itemInfo[0], count: parseFloat(itemInfo[1])};
        } else {
            return {barcode: itemInfo[0], count: 1};
        }
    });
}

function generateItemDetails(parsedItems) {
  return parsedItems.reduce((result, itemPhurased) => {
    const item = result.filter(itemDetail => itemDetail.itemInfo.barcode === itemPhurased.barcode);
    if(item.length !== 0) {
      item[0].count += itemPhurased.count;
      item[0].total = getItemTotalCost(item[0].itemInfo, item[0].count);
    } else {
      const itemOriginInfo = findItemDetailByBarcode(itemPhurased.barcode);
      result.push({itemInfo: itemOriginInfo, count: itemPhurased.count, total: getItemTotalCost(itemOriginInfo, itemPhurased.count)});
    }
    return result;
  }, []);
}

function findItemDetailByBarcode(barcode) {
  return allItems.filter(item => item.barcode === barcode)[0];
}

function getItemTotalCost(itemInfo, count) {
    const promotionType = getItemPromotionType(itemInfo.barcode);
    return promotionType === 'BUY_TWO_GET_ONE_FREE' ? itemInfo.price * (count - Math.floor(count / 3)) : itemInfo.price * count;
}

function generateReceiptTemplate(itemDetails, totalCost, minusPrice) {
  return `***<没钱赚商店>收据***
${itemDetails}
----------------------
总计：${formatPrice(totalCost)}(元)
节省：${formatPrice(minusPrice)}(元)
**********************`;
}

function getTotalCost(items) {
  return items.reduce((totalCost, item) => totalCost + item.total, 0);
}

function getMinusCost(items) {
    return items.reduce((minusCost, item) => minusCost + item.itemInfo.price * item.count - item.total, 0);
  }
  
function getItemPromotionType(barcode) {
    const promotionDetail = promotion.filter(promotionType => promotionType.barcodes.includes(barcode));
    return promotionDetail.length > 0 ? promotionDetail[0].type : null;
}

function gernerateItemDescription(itemDetail) {
  return `名称：${itemDetail.itemInfo.name}，数量：${itemDetail.count}${itemDetail.itemInfo.unit}，单价：${formatPrice(itemDetail.itemInfo.price)}(元)，小计：${formatPrice(itemDetail.total)}(元)`;
}

function generateReciptBody(items) {
  return items.map(item => gernerateItemDescription(item)).join('\n');
}

function formatPrice(price) {
  return price.toFixed(2);
}