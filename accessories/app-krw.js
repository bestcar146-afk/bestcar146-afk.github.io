'use strict';
const {catalog, guides} = window;
const get = id => document.getElementById(id);
const filters = get('filters');
const vehicle = get('vehicle');
const year = get('year');
const area = get('area');
const query = get('query');
const sort = get('sort');
const grid = get('grid');
const details = get('details');
const pageSize = 18;
let page = 1;
const won = new Intl.NumberFormat('en-US', {style:'currency', currency:'KRW', maximumFractionDigits:0});
const {map: billPriceMap, rows: billRows} = window.billPrices;
const billPrice = item => billPriceMap[item.vehicle]?.[item.code];
// Median observed ratio: ₩1,000 per original catalog USD across 25 matched parts.
const estimatedPrices = {
  "[\"Accent\",\"D579\",\"Accent\",\"2011~2016\"]": 14000,
  "[\"Accent\",\"D523\",\"Accent\",\"2011~2016\"]": 28000,
  "[\"Accent\",\"E625\",\"Accent\",\"2011~2016\"]": 12000,
  "[\"Accent\",\"E952\",\"Accent\",\"2011~2016\"]": 26000,
  "[\"Accent\",\"C412\",\"Accent long\",\"2011~2016\"]": 24000,
  "[\"Accent\",\"B722\",\"Accent\",\"2011~2016\"]": 23000,
  "[\"Accent\",\"C743\",\"Accent\",\"2011~2016\"]": 28000,
  "[\"Accent\",\"B225\",\"Accent\",\"2011~2016\"]": 28000,
  "[\"Bongo III\",\"D581\",\"Bongo 3\",\"2004~Current\"]": 19000,
  "[\"Bongo III\",\"D525\",\"Bongo 3\",\"2004~Current\"]": 32000,
  "[\"Bongo III\",\"E615\",\"Bongo 3\",\"2004~Current\"]": 16000,
  "[\"Bongo III\",\"E941\",\"Bongo 3\",\"2004~Current\"]": 31000,
  "[\"Bongo III\",\"D852\",\"Bongo 3\",\"2004~Current\"]": 20000,
  "[\"Grand Starex\",\"D541\",\"Grand Starex\",\"2007~2017\"]": 15000,
  "[\"Grand Starex\",\"D500\",\"Grand Starex\",\"2007~2017\"]": 30000,
  "[\"Grand Starex\",\"E643\",\"Grand Starex\",\"2007~2017\"]": 12000,
  "[\"Grand Starex\",\"E927\",\"Grand Starex\",\"2007~2017\"]": 28000,
  "[\"Grand Starex\",\"B223\",\"Grand Starex\",\"2007~2014\"]": 55000,
  "[\"Grand Starex\",\"C739\",\"Grand Starex\",\"2007~2014\"]": 19000,
  "[\"Porter II\",\"D580\",\"Porter 2\",\"2004~Current\"]": 19000,
  "[\"Porter II\",\"D524\",\"Porter 2\",\"2004~Current\"]": 32000,
  "[\"Porter II\",\"E638\",\"Porter 2\",\"2004~Current\"]": 16000,
  "[\"Porter II\",\"E970\",\"Porter 2\",\"2004~Current\"]": 31000,
  "[\"Porter II\",\"C461\",\"Porter 2 2012\",\"2012~Current\"]": 12000,
  "[\"Porter II\",\"A397\",\"Porter 2\",\"2004~Current\"]": 19000,
  "[\"Porter II\",\"D851\",\"Porter 2\",\"2004~Current\"]": 20000,
  "[\"Porter II\",\"C734\",\"Porter 2 2012\",\"2012~Current\"]": 28000,
  "[\"Santa Fe CM\",\"D545\",\"New Santafe\",\"2006~2011\"]": 15000,
  "[\"Santa Fe CM\",\"E859\",\"New Santafe\",\"2006~2008\"]": 32000,
  "[\"Santa Fe CM\",\"E660\",\"New Santafe\",\"2006~2011\"]": 12000,
  "[\"Santa Fe CM\",\"E945\",\"New Santafe\",\"2006~2008\"]": 31000,
  "[\"Santa Fe CM\",\"A764\",\"New Santafe\",\"2006~2008\"]": 17000,
  "[\"Santa Fe CM\",\"B663\",\"New Santafe 2009\",\"2009~2011\"]": 21000,
  "[\"Santa Fe CM\",\"A361\",\"New Santafe\",\"2006~2011\"]": 19000,
  "[\"Santa Fe DM\",\"D543\",\"Santafe 2012\",\"2012~Current\"]": 17000,
  "[\"Santa Fe DM\",\"D543\",\"Santafe 2015\",\"2012~2017\"]": 17000,
  "[\"Santa Fe DM\",\"D502\",\"Santafe 2012\",\"2012~Current\"]": 32000,
  "[\"Santa Fe DM\",\"D502\",\"Santafe 2015\",\"2012~2017\"]": 32000,
  "[\"Santa Fe DM\",\"E661\",\"Santafe 2012\",\"2012~Current\"]": 14000,
  "[\"Santa Fe DM\",\"E947\",\"Santafe 2012\",\"2012~Current\"]": 31000,
  "[\"Santa Fe DM\",\"C452\",\"Santafe 2012\",\"2012~2014\"]": 27000,
  "[\"Santa Fe DM\",\"C443\",\"Santafe 2012\",\"2012~2014\"]": 19000,
  "[\"Santa Fe DM\",\"D818\",\"Santafe 2015\",\"2015~2017\"]": 27000,
  "[\"Santa Fe DM\",\"D829\",\"Santafe 2015\",\"2015~2017\"]": 23000,
  "[\"Santa Fe DM\",\"C441\",\"Santafe 2012\",\"2012~2014\"]": 23000,
  "[\"Santa Fe DM\",\"B229\",\"Santafe 2012\",\"2012~2014\"]": 36000,
  "[\"Sorento\",\"D544\",\"Sorento R\",\"2009~2013\"]": 17000,
  "[\"Sorento\",\"D503\",\"Sorento R\",\"2009~2013\"]": 32000,
  "[\"Sorento\",\"E663\",\"Sorento R\",\"2009~2013\"]": 14000,
  "[\"Sorento\",\"E949\",\"Sorento R\",\"2009~2013\"]": 31000,
  "[\"Sorento\",\"C477\",\"Sorento R(2012~)\",\"2012~2013\"]": 10000,
  "[\"Sorento\",\"C448\",\"Sorento R(2012~)\",\"2012~2013\"]": 24000,
  "[\"Sorento\",\"C478\",\"Sorento R(2012~)\",\"2012~2013\"]": 30000,
  "[\"Sorento\",\"B642\",\"Sorento R(~2011)\",\"2009~2011\"]": 26000,
  "[\"Sorento\",\"B659\",\"Sorento R(~2011)\",\"2009~2011\"]": 18000,
  "[\"Sorento\",\"C462\",\"Sorento R(2012~)\",\"2012~2013\"]": 23000,
  "[\"Sorento\",\"B638\",\"Sorento R(~2011)\",\"2009~2011\"]": 21000,
  "[\"Sportage R\",\"D542\",\"Sportage 2010\",\"2010~2014\"]": 17000,
  "[\"Sportage R\",\"D501\",\"Sportage 2010\",\"2010~2014\"]": 32000,
  "[\"Sportage R\",\"E659\",\"Sportage 2010\",\"2010~2014\"]": 14000,
  "[\"Sportage R\",\"E944\",\"Sportage 2010\",\"2010~2014\"]": 31000,
  "[\"Tucson\",\"D546\",\"Tucson\",\"2004~2008\"]": 15000,
  "[\"Tucson\",\"D593\",\"Tucson 2009\",\"2009~2012\"]": 17000,
  "[\"Tucson\",\"D539\",\"Tucson 2009\",\"2009~2012\"]": 32000,
  "[\"Tucson\",\"E857\",\"Tucson\",\"2004~2008\"]": 32000,
  "[\"Tucson\",\"E678\",\"Tucson\",\"2004~2008\"]": 12000,
  "[\"Tucson\",\"E635\",\"Tucson 2009\",\"2009~2012\"]": 14000,
  "[\"Tucson\",\"E966\",\"Tucson\",\"2004~2008\"]": 31000,
  "[\"Tucson\",\"E967\",\"Tucson 2009\",\"2009~2012\"]": 31000,
  "[\"Tucson\",\"A763\",\"Tucson\",\"2004~2008\"]": 13000,
  "[\"Tucson\",\"B634\",\"Tucson 2009\",\"2009~2012\"]": 24000,
  "[\"Tucson\",\"B692\",\"Tucson 2009\",\"2009~2012\"]": 24000,
  "[\"Tucson\",\"B665\",\"Tucson 2009\",\"2009~2012\"]": 26000,
  "[\"Tucson\",\"C491\",\"Tucson 2013\",\"2013~2014\"]": 24000,
  "[\"Tucson\",\"A362\",\"Tucson\",\"2004~2008\"]": 19000,
  "[\"Tucson\",\"B635\",\"Tucson 2009\",\"2009~2012\"]": 21000,
  "[\"Tucson\",\"C486\",\"Tucson 2013\",\"2013~2014\"]": 21000,
  "[\"Tucson\",\"B222\",\"Tucson 2009\",\"2009~2012\"]": 33000,
  "[\"Tucson\",\"B221\",\"Tucson 2009\",\"2009~2012\"]": 17000,
  "[\"Accent\",\"A482\",\"Accent long\",\"2011~2016\"]": 16000,
  "[\"Accent\",\"A126\",\"Accent long\",\"2011~2016\"]": 11000,
  "[\"Accent\",\"B230\",\"Accent\",\"2011~2016\"]": 20000,
  "[\"Accent\",\"C115\",\"Accent long\",\"2011~2016\"]": 20000,
  "[\"Accent\",\"B918\",\"Accent long\",\"2011~2016\"]": 10000,
  "[\"Accent\",\"B150\",\"Accent\",\"2011~2016\"]": 8000,
  "[\"Bongo III\",\"A917\",\"Bongo 3\",\"2004~Current\"]": 13000,
  "[\"Bongo III\",\"B941\",\"Bongo 3\",\"2004~Current\"]": 19000,
  "[\"Bongo III\",\"A318\",\"Bongo 3\",\"2004~Current\"]": 16000,
  "[\"Bongo III\",\"C292\",\"Bongo 3\",\"2004~Current\"]": 21000,
  "[\"Bongo III\",\"A660\",\"Bongo 3\",\"2004~Current\"]": 8000,
  "[\"Grand Starex\",\"B461\",\"Grand Starex\",\"2007~Current\"]": 10000,
  "[\"Grand Starex\",\"A916\",\"Grand Starex\",\"2007~Current\"]": 16000,
  "[\"Grand Starex\",\"C181\",\"Grand Starex\",\"2007~Current\"]": 27000,
  "[\"Porter II\",\"A204\",\"Porter 2\",\"2004~Current\"]": 16000,
  "[\"Porter II\",\"A161\",\"Porter 2\",\"2004~Current\"]": 10000,
  "[\"Porter II\",\"A918\",\"Porter 2\",\"2004~Current\"]": 13000,
  "[\"Porter II\",\"B940\",\"Porter 2\",\"2004~Current\"]": 19000,
  "[\"Porter II\",\"A319\",\"Porter 2\",\"2004~Current\"]": 16000,
  "[\"Porter II\",\"A660\",\"Porter 2\",\"2004~Current\"]": 8000,
  "[\"Pride\",\"A468\",\"New Pride(4) 2009\",\"2009~Current\"]": 16000,
  "[\"Pride\",\"A479\",\"New Pride(5) 2009\",\"2009~2010\"]": 16000,
  "[\"Pride\",\"A112\",\"New Pride(4) 2009\",\"2009~Current\"]": 10000,
  "[\"Pride\",\"A128\",\"New Pride(5) 2009\",\"2009~2010\"]": 10000,
  "[\"Santa Fe CM\",\"A449\",\"New Santafe\",\"2006~2011\"]": 16000,
  "[\"Santa Fe CM\",\"A093\",\"New Santafe\",\"2006~2011\"]": 10000,
  "[\"Santa Fe CM\",\"A871\",\"New Santafe\",\"2006~2011\"]": 20000,
  "[\"Santa Fe CM\",\"C103\",\"New Santafe\",\"2006~2011\"]": 20000,
  "[\"Santa Fe CM\",\"A317\",\"New Santafe\",\"2006~2011\"]": 18000,
  "[\"Santa Fe CM\",\"A620\",\"New Santafe\",\"2006~2011\"]": 9000,
  "[\"Santa Fe DM\",\"D954\",\"Santafe 2012\",\"2012~2014\"]": 44000,
  "[\"Santa Fe DM\",\"D950\",\"Santafe 2015\",\"2015~2017\"]": 44000,
  "[\"Santa Fe DM\",\"C503\",\"Santafe 2012\",\"2012~2014\"]": 18000,
  "[\"Santa Fe DM\",\"C504\",\"Santafe 2012\",\"2012~2014\"]": 16000,
  "[\"Santa Fe DM\",\"D631\",\"Santafe 2015\",\"2015~2017\"]": 18000,
  "[\"Santa Fe DM\",\"D632\",\"Santafe 2015\",\"2015~2017\"]": 16000,
  "[\"Santa Fe DM\",\"A144\",\"Santafe 2012\",\"2012~2014\"]": 12000,
  "[\"Santa Fe DM\",\"A145\",\"Santafe 2012\",\"2012~2014\"]": 11000,
  "[\"Santa Fe DM\",\"D063\",\"Santafe 2015\",\"2015~2017\"]": 12000,
  "[\"Santa Fe DM\",\"D064\",\"Santafe 2015\",\"2015~2017\"]": 11000,
  "[\"Santa Fe DM\",\"B163\",\"Santafe 2012\",\"2012~Current\"]": 8000,
  "[\"Santa Fe DM\",\"B163\",\"Santafe 2015\",\"2012~2017\"]": 8000,
  "[\"Sorento\",\"A109\",\"Sorento R\",\"2009~2013\"]": 10000,
  "[\"Sorento\",\"A914\",\"Sorento R\",\"2009~2013\"]": 20000,
  "[\"Sorento\",\"C102\",\"Sorento R\",\"2009~2013\"]": 20000,
  "[\"Sorento\",\"B906\",\"Sorento R\",\"2009~2013\"]": 16000,
  "[\"Sorento\",\"A976\",\"Sorento R\",\"2009~2013\"]": 8000,
  "[\"Sportage R\",\"A858\",\"Sportage 2010\",\"2010~2014\"]": 20000,
  "[\"Sportage R\",\"C101\",\"Sportage 2010\",\"2010~2014\"]": 20000,
  "[\"Sportage R\",\"B910\",\"Sportage 2010\",\"2010~2014\"]": 13000,
  "[\"Sportage R\",\"A977\",\"Sportage 2010\",\"2010~2014\"]": 8000,
  "[\"Tucson\",\"A424\",\"Tucson\",\"2004~2008\"]": 16000,
  "[\"Tucson\",\"A076\",\"Tucson\",\"2004~2008\"]": 10000,
  "[\"Tucson\",\"A116\",\"Tucson 2009\",\"2009~2012\"]": 10000,
  "[\"Tucson\",\"A116\",\"Tucson 2013\",\"2009~2014\"]": 10000,
  "[\"Tucson\",\"A868\",\"Tucson\",\"2004~2008\"]": 20000,
  "[\"Tucson\",\"A919\",\"Tucson 2009\",\"2009~2014\"]": 20000,
  "[\"Tucson\",\"A919\",\"Tucson 2013\",\"2009~2014\"]": 20000,
  "[\"Tucson\",\"C113\",\"Tucson\",\"2004~2008\"]": 20000,
  "[\"Tucson\",\"C100\",\"Tucson 2009\",\"2009~2014\"]": 20000,
  "[\"Tucson\",\"C100\",\"Tucson 2013\",\"2009~2014\"]": 20000,
  "[\"Tucson\",\"B902\",\"Tucson 2009\",\"2009~2014\"]": 15000,
  "[\"Tucson\",\"B902\",\"Tucson 2013\",\"2009~2014\"]": 15000,
  "[\"Tucson\",\"A315\",\"Tucson\",\"2004~2008\"]": 16000,
  "[\"Tucson\",\"A975\",\"Tucson 2009\",\"2009~2014\"]": 8000,
  "[\"Tucson\",\"A975\",\"Tucson 2013\",\"2009~2014\"]": 8000,
  "[\"Accent\",\"B429\",\"Accent\",\"2011~2016\"]": 16000,
  "[\"Accent\",\"B319\",\"Accent\",\"2011~2016\"]": 8000,
  "[\"Accent\",\"B700\",\"Accent\",\"2011~2016\"]": 15000,
  "[\"Accent\",\"B723\",\"Accent\",\"2011~2016\"]": 15000,
  "[\"Accent\",\"B815\",\"Accent\",\"2011~2016\"]": 11000,
  "[\"Accent\",\"B819\",\"Accent\",\"2011~2016\"]": 11000,
  "[\"Bongo III\",\"C325\",\"Bongo 3\",\"2004~Current\"]": 10000,
  "[\"Bongo III\",\"A749\",\"Bongo 3\",\"2004~Current\"]": 9000,
  "[\"Bongo III\",\"C661\",\"Bongo 3\",\"2004~Current\"]": 15000,
  "[\"Grand Starex\",\"B417\",\"Grand Starex\",\"2007~Current\"]": 15000,
  "[\"Grand Starex\",\"C095\",\"Grand Starex\",\"2007~Current\"]": 17000,
  "[\"Porter II\",\"B409\",\"Porter 2\",\"2004~Current\"]": 16000,
  "[\"Porter II\",\"B408\",\"Porter 2\",\"2004~Current\"]": 16000,
  "[\"Porter II\",\"C326\",\"Porter 2\",\"2004~Current\"]": 10000,
  "[\"Porter II\",\"C665\",\"Porter 2\",\"2004~Current\"]": 15000,
  "[\"Porter II\",\"C660\",\"Porter 2\",\"2004~Current\"]": 15000,
  "[\"Porter II\",\"A293\",\"Porter 2\",\"2004~Current\"]": 10000,
  "[\"Santa Fe CM\",\"B405\",\"New Santafe\",\"2006~2011\"]": 15000,
  "[\"Santa Fe CM\",\"C313\",\"New Santafe\",\"2006~2011\"]": 14000,
  "[\"Santa Fe CM\",\"A214\",\"New Santafe\",\"2006~1011\"]": 8000,
  "[\"Santa Fe CM\",\"A798\",\"New Santafe 2009\",\"2006~Current\"]": 15000,
  "[\"Santa Fe CM\",\"A367\",\"New Santafe\",\"2006~2008\"]": 13000,
  "[\"Santa Fe CM\",\"B812\",\"New Santafe\",\"2006~2011\"]": 11000,
  "[\"Santa Fe DM\",\"B433\",\"Santafe 2012\",\"2012~Current\"]": 17000,
  "[\"Santa Fe DM\",\"B433\",\"Santafe 2015\",\"2012~2017\"]": 17000,
  "[\"Santa Fe DM\",\"C062\",\"Santafe 2012\",\"2012~Current\"]": 14000,
  "[\"Santa Fe DM\",\"C062\",\"Santafe 2015\",\"2012~2017\"]": 14000,
  "[\"Santa Fe DM\",\"B339\",\"Santafe 2012\",\"2012~Current\"]": 8000,
  "[\"Santa Fe DM\",\"B339\",\"Santafe 2015\",\"2012~2017\"]": 8000,
  "[\"Santa Fe DM\",\"C446\",\"Santafe 2012\",\"2012~2013\"]": 20000,
  "[\"Santa Fe DM\",\"C474\",\"Santafe 2015\",\"2013~2017\"]": 20000,
  "[\"Santa Fe DM\",\"B900\",\"Santafe 2012\",\"2012~2017\"]": 11000,
  "[\"Sorento\",\"B414\",\"Sorento R\",\"2009~2013\"]": 17000,
  "[\"Sorento\",\"C314\",\"Sorento R\",\"2009~2013\"]": 14000,
  "[\"Sorento\",\"B639\",\"Sorento R\",\"2009~2011\"]": 17000,
  "[\"Sorento\",\"B640\",\"Sorento R\",\"2009~2013\"]": 17000,
  "[\"Sportage R\",\"B419\",\"Sportage 2010\",\"2010~2014\"]": 17000,
  "[\"Sportage R\",\"C312\",\"Sportage 2010\",\"2010~2014\"]": 14000,
  "[\"Sportage R\",\"B694\",\"Sportage 2010\",\"2010~2012\"]": 17000,
  "[\"Sportage R\",\"C422\",\"Sportage 2010\",\"2010~2012\"]": 17000,
  "[\"Sportage R\",\"B810\",\"Sportage 2010\",\"2010~2014\"]": 10000,
  "[\"Tucson\",\"B425\",\"Tucson 2009\",\"2009~2014\"]": 17000,
  "[\"Tucson\",\"B403\",\"Tucson\",\"2004~2008\"]": 16000,
  "[\"Tucson\",\"B411\",\"Tucson 2009\",\"2009~2012\"]": 17000,
  "[\"Tucson\",\"C311\",\"Tucson 2009\",\"2009~2014\"]": 14000,
  "[\"Tucson\",\"C311\",\"Tucson 2013\",\"2009~2014\"]": 14000,
  "[\"Tucson\",\"B346\",\"Tucson 2013\",\"2009~2014\"]": 12000,
  "[\"Tucson\",\"A215\",\"Tucson\",\"2004~2008\"]": 8000,
  "[\"Tucson\",\"B314\",\"Tucson 2009\",\"2009~2014\"]": 8000,
  "[\"Tucson\",\"B314\",\"Tucson 2013\",\"2009~2014\"]": 8000,
  "[\"Tucson\",\"A368\",\"Tucson\",\"2004~2008\"]": 13000,
  "[\"Tucson\",\"B691\",\"Tucson 2009\",\"2009~2014\"]": 17000,
  "[\"Tucson\",\"B661\",\"Tucson 2009\",\"2009~2012\"]": 17000,
  "[\"Tucson\",\"B690\",\"Tucson 2009\",\"2009~2014\"]": 17000,
  "[\"Tucson\",\"B636\",\"Tucson 2009\",\"2009~2012\"]": 17000,
  "[\"Tucson\",\"A265\",\"Tucson\",\"2004~2008\"]": 10000,
  "[\"Tucson\",\"B808\",\"Tucson 2009\",\"2009~2014\"]": 10000,
  "[\"Tucson\",\"B808\",\"Tucson 2013\",\"2009~2014\"]": 10000,
  "[\"Tucson\",\"B822\",\"Tucson 2013\",\"2009~2014\"]": 10000,
  "[\"Tucson\",\"B822\",\"Tucson 2009\",\"2009~2014\"]": 10000,
  "[\"Accent\",\"B755\",\"Accent\",\"2011~2016\"]": 20000,
  "[\"Accent\",\"C600\",\"Accent long\",\"2011~2016\"]": 38000,
  "[\"Bongo III\",\"C619\",\"Bongo 3\",\"2004~Current\"]": 38000,
  "[\"Grand Starex\",\"C248\",\"Grand Starex\",\"2007~Current\"]": 31000,
  "[\"Grand Starex\",\"A333\",\"Grand Starex\",\"2007~2017\"]": 27000,
  "[\"Grand Starex\",\"E591\",\"Grand Starex\",\"2007~2017\"]": 32000,
  "[\"Porter II\",\"A540\",\"Porter 2\",\"2004~Current\"]": 21000,
  "[\"Porter II\",\"C219\",\"Porter 2\",\"2004~Current\"]": 38000,
  "[\"Santa Fe CM\",\"A354\",\"New Santafe\",\"2006~2008\"]": 50000,
  "[\"Santa Fe CM\",\"A539\",\"New Santafe 2009\",\"2009~2011\"]": 50000,
  "[\"Santa Fe DM\",\"B758\",\"Santafe 2012\",\"2012~Current\"]": 23000,
  "[\"Santa Fe DM\",\"B758\",\"Santafe 2015\",\"2012~2017\"]": 23000,
  "[\"Santa Fe DM\",\"C605\",\"Santafe 2012\",\"2012~Current\"]": 38000,
  "[\"Santa Fe DM\",\"C605\",\"Santafe 2015\",\"2012~2017\"]": 38000,
  "[\"Sorento\",\"B753\",\"Sorento R\",\"2009~2013\"]": 30000,
  "[\"Sportage R\",\"B752\",\"Sportage 2010\",\"2010~2014\"]": 23000,
  "[\"Tucson\",\"B675\",\"Tucson 2009\",\"2009~2014\"]": 20000,
  "[\"Tucson\",\"B675\",\"Tucson 2013\",\"2009~2014\"]": 20000,
  "[\"Tucson\",\"A536\",\"Tucson 2009\",\"2009~2012\"]": 41000,
  "[\"Tucson\",\"A538\",\"Tucson 2009\",\"2009~2012\"]": 41000,
  "[\"Tucson\",\"A571\",\"Tucson 2009\",\"2009~2012\"]": 41000,
  "[\"Accent\",\"B724\",\"Accent long\",\"2011~2016\"]": 21000,
  "[\"Bongo III\",\"C458\",\"Bongo 3\",\"2004~Current\"]": 25000,
  "[\"Grand Starex\",\"C180\",\"Grand Starex\",\"2007~Current\"]": 10000,
  "[\"Grand Starex\",\"A750\",\"Grand Starex\",\"2007~2017\"]": 19000,
  "[\"Grand Starex\",\"C710\",\"Grand Starex\",\"2007~Current\"]": 16000,
  "[\"Grand Starex\",\"C816\",\"Grand Starex\",\"2007~Current\"]": 25000,
  "[\"Grand Starex\",\"B741\",\"Grand Starex\",\"2007~Current\"]": 10000,
  "[\"Grand Starex\",\"D786\",\"Grand Starex\",\"2007~2014\"]": 17000,
  "[\"Porter II\",\"C459\",\"Porter 2\",\"2004~Current\"]": 25000,
  "[\"Santa Fe CM\",\"A364\",\"New Santafe\",\"2006~2008\"]": 17000,
  "[\"Santa Fe CM\",\"B662\",\"New Santafe 2009\",\"2009~2011\"]": 18000,
  "[\"Santa Fe CM\",\"C270\",\"New Santafe\",\"2006~2011\"]": 16000,
  "[\"Santa Fe CM\",\"B743\",\"New Santafe\",\"2006~2008\"]": 19000,
  "[\"Santa Fe CM\",\"B744\",\"New Santafe 2009\",\"2009~2011\"]": 19000,
  "[\"Santa Fe DM\",\"C442\",\"Santafe 2012\",\"2012~2014\"]": 32000,
  "[\"Santa Fe DM\",\"C450\",\"Santafe 2012\",\"2012~2014\"]": 21000,
  "[\"Santa Fe DM\",\"D830\",\"Santafe 2015\",\"2015~2017\"]": 21000,
  "[\"Santa Fe DM\",\"C279\",\"Santafe 2012\",\"2012~2017\"]": 16000,
  "[\"Santa Fe DM\",\"C279\",\"Santafe 2015\",\"2012~2017\"]": 16000,
  "[\"Santa Fe DM\",\"C281\",\"Santafe 2012_CN\",\"2012~Current\"]": 16000,
  "[\"Santa Fe DM\",\"C753\",\"Santafe 2012\",\"2012~2017\"]": 21000,
  "[\"Santa Fe DM\",\"C753\",\"Santafe 2015\",\"2012~2017\"]": 21000,
  "[\"Sorento\",\"C449\",\"Sorento R(2012~)\",\"2012~2013\"]": 20000,
  "[\"Sorento\",\"B641\",\"Sorento R(~2011)\",\"2009~2011\"]": 17000,
  "[\"Sorento\",\"C755\",\"Sorento R(2012~)\",\"2012~2013\"]": 27000,
  "[\"Sportage R\",\"B683\",\"Sportage 2010\",\"2010~2014\"]": 20000,
  "[\"Tucson\",\"A365\",\"Tucson\",\"2004~2008\"]": 17000,
  "[\"Tucson\",\"B637\",\"Tucson 2009\",\"2009~2012\"]": 20000,
  "[\"Tucson\",\"C487\",\"Tucson 2013\",\"2013~2014\"]": 20000,
  "[\"Tucson\",\"B721\",\"Tucson 2009\",\"2009~2014\"]": 12000,
  "[\"Tucson\",\"B721\",\"Tucson 2013\",\"2009~2014\"]": 12000,
  "[\"Tucson\",\"B728\",\"Tucson\",\"2004~2008\"]": 15000,
  "[\"Tucson\",\"C821\",\"Tucson\",\"2004~2008\"]": 25000,
  "[\"Tucson\",\"C759\",\"Tucson 2013\",\"2013~2014\"]": 27000,
  "[\"Accent\",\"B786\",\"Accent\",\"2011~2016\"]": 15000,
  "[\"Bongo III\",\"C393\",\"Bongo 3\",\"2004~Current\"]": 18000,
  "[\"Grand Starex\",\"C355\",\"Grand Starex\",\"2007~2014\"]": 18000,
  "[\"Porter II\",\"C394\",\"Porter 2\",\"2004~Current\"]": 16000,
  "[\"Santa Fe CM\",\"C372\",\"New Santafe 2009\",\"2009~2011\"]": 18000,
  "[\"Santa Fe CM\",\"C371\",\"New Santafe\",\"2006~2008\"]": 18000,
  "[\"Santa Fe DM\",\"C673\",\"Santafe 2012\",\"2012~2017\"]": 27000,
  "[\"Sorento\",\"C392\",\"Sorento R(2012~)\",\"2012~2013\"]": 31000,
  "[\"Sorento\",\"C373\",\"Sorento R(~2011)\",\"2009~2011\"]": 21000,
  "[\"Sportage R\",\"C361\",\"Sportage 2010\",\"2010~2012\"]": 18000,
  "[\"Tucson\",\"C358\",\"Tucson 2009\",\"2009~2014\"]": 20000,
  "[\"Tucson\",\"C358\",\"Tucson 2013\",\"2009~2014\"]": 20000,
  "[\"Tucson\",\"C364\",\"Tucson 2009\",\"2009~2014\"]": 20000,
  "[\"Tucson\",\"C364\",\"Tucson 2013\",\"2009~2014\"]": 20000,
  "[\"Bongo III\",\"C720\",\"Bongo 3\",\"2004~Current\"]": 14000,
  "[\"Bongo III\",\"C724\",\"Bongo 3\",\"2004~Current\"]": 14000,
  "[\"Bongo III\",\"C197\",\"Bongo 3\",\"2004~Current\"]": 18000,
  "[\"Bongo III\",\"C345\",\"Bongo 3\",\"2004~Current\"]": 18000,
  "[\"Grand Starex\",\"D891\",\"Grand Starex\",\"2007~Current\"]": 16000,
  "[\"Grand Starex\",\"C196\",\"Grand Starex\",\"2007~Current\"]": 19000,
  "[\"Porter II\",\"C197\",\"Porter 2\",\"2004~Current\"]": 18000,
  "[\"Porter II\",\"C343\",\"Porter 2\",\"2012~Current\"]": 18000,
  "[\"Porter II\",\"C346\",\"Porter 2\",\"2004~Current\"]": 18000,
  "[\"Santa Fe DM\",\"C152\",\"Santafe 2012\",\"2012~2017\"]": 16000,
  "[\"Santa Fe DM\",\"C152\",\"Santafe 2015\",\"2012~2017\"]": 16000,
  "[\"Santa Fe DM\",\"C336\",\"Santafe 2012\",\"2012~2014\"]": 27000,
  "[\"Santa Fe DM\",\"C349\",\"Santafe 2012_CN\",\"2012~2014\"]": 27000,
  "[\"Santa Fe DM\",\"C348\",\"Santafe 2012_CN\",\"2012~2014\"]": 16000,
  "[\"Sorento\",\"C331\",\"Sorento R(~2011)\",\"2009~2011\"]": 21000,
  "[\"Sportage R\",\"C151\",\"Sportage 2010\",\"2010~2014\"]": 27000,
  "[\"Sportage R\",\"C333\",\"Sportage 2010\",\"2010~2014\"]": 21000,
  "[\"Tucson\",\"C150\",\"Tucson 2009\",\"2009~2014\"]": 27000,
  "[\"Tucson\",\"C150\",\"Tucson 2013\",\"2009~2014\"]": 27000,
  "[\"Tucson\",\"C700\",\"Tucson 2013\",\"2013~2014\"]": 27000
};
const priceAmount = item => billPrice(item)?.price ??
  estimatedPrices[JSON.stringify([item.vehicle, item.code, item.model, item.years])];
const formatPrice = item => won.format(priceAmount(item));
function comparePrices(a, b) {
  if (!sort.value) return 0;
  const difference = priceAmount(a) - priceAmount(b);
  return sort.value === 'low' ? difference : -difference;
}
const billList = get('bill-price-rows');
for (const [vehicleName, date, name, price, inferred] of billRows) {
  const row = document.createElement('tr');
  for (const value of [vehicleName, date, name, won.format(price) + (inferred ? ' (inferred in workbook)' : '')]) {
    const cell = document.createElement('td');
    cell.textContent = value;
    row.append(cell);
  }
  billList.append(row);
}
const formatYear = value => value.replace('~', '–').replace(/current/i, 'onward');
function options(select, values) {
  select.append(...values.map(value => new Option(value, value)));
}
function bounds(value) {
  const matches = (value.match(/\b(?:19|20)\d{2}\b/g) || []).map(Number);
  if (matches.length === 2 && matches[0] <= matches[1]) return matches;
  if (matches.length === 1 && /current/i.test(value)) return [matches[0], Infinity];
  if (matches.length === 1 && !value.includes('~')) return [matches[0], matches[0]];
  return null;
}
function yearFits(item, selected) {
  const range = bounds(item.years);
  return !selected || (range && selected >= range[0] && selected <= range[1]);
}
function updateYears() {
  const previous = year.value;
  const years = new Set();
  for (const item of catalog.filter(item => !vehicle.value || item.vehicle === vehicle.value)) {
    const range = bounds(item.years);
    if (!range) continue;
    const last = Number.isFinite(range[1]) ? range[1] : new Date().getFullYear();
    for (let y = range[0]; y <= last; y++) years.add(y);
  }
  year.replaceChildren(new Option('Any year', ''));
  options(year, [...years].sort((a,b)=>b-a));
  if (years.has(Number(previous))) year.value = previous;
  buildChips("year-chips", year);
}
function node(tag, value, className) {
  const el = document.createElement(tag);
  el.textContent = value;
  if (className) el.className = className;
  return el;
}
function showPartPhoto(container, item, lazy = true) {
  const fallback = window.accessoryPhotos?.[item.vehicle]?.[item.code];
  const code = String(item.code).trim().toUpperCase();
  const supplierPhoto = /^[A-Z][0-9]{3}$/.test(code)
    ? 'https://www.autoclover.com/autoclover/upload/itemcard/' + code + '_std_0.jpg'
    : '';
  const empty = () => container.replaceChildren(node('span', 'Photo unavailable'));
  if (!supplierPhoto && !fallback) { empty(); return; }
  const image = document.createElement('img');
  image.alt = item.name + ' — ' + item.vehicle + ' (' + item.code + ')';
  image.loading = lazy ? 'lazy' : 'eager';
  image.referrerPolicy = 'no-referrer';
  image.addEventListener('error', () => {
    if (fallback && image.getAttribute('src') !== fallback) image.src = fallback;
    else empty();
  });
  image.src = supplierPhoto || fallback;
  container.replaceChildren(image);
}
function showDetails(item) {
  get('detail-title').textContent = item.name;
  const metadata = node('div', '', 'metadata');
  for (const text of [item.vehicle, formatYear(item.years), 'Code ' + item.code, item.pieces, formatPrice(item)]) {
    if (text) metadata.append(node('span', text));
  }
  const content = get('detail-content');
  content.replaceChildren(metadata, node('p',item.location), node('p','Catalog fit: '+item.model),
    node('h3','Supplier fitting guide','guide-label'),node('p','Match the item code on the guide when shown. Select a guide to download it.','guide-note'));
  const bill = billPrice(item);
  content.append(node('p', bill ? 'Workbook price from ' + bill.date + ' · ' + bill.name : 'Estimated price. Confirm with Best Car Star when requesting a quote.', 'guide-note'));
  const photo = node('div', '', 'part-photo detail-photo');
  showPartPhoto(photo, item, false);
  content.prepend(photo);
  appendGuides(content,item.vehicle);
  details.showModal();
}
const guideLoads = new Map();
const assetOrder = ["media/guide-1.webp", "media/guide-2.webp", "media/guide-3.webp", "media/guide-4.webp", "media/guide-5.webp", "media/guide-6.webp", "media/guide-7.webp", "media/guide-8.webp", "media/guide-9.webp", "media/guide-10.webp", "media/guide-11.webp", "media/guide-12.webp", "media/guide-13.webp", "media/guide-14.webp", "media/guide-15.webp", "media/guide-16.webp", "media/guide-17.webp"];
function loadGuide(path) {
  if (!guideLoads.has(path)) {
    const index = assetOrder.indexOf(path);
    guideLoads.set(path,new Promise((resolve,reject)=>{
      const script=document.createElement('script');
      script.src='asset'+index+'.js';
      script.onload=()=>resolve(window.guideImages[path]);
      script.onerror=()=>{guideLoads.delete(path);script.remove();reject(new Error('Guide unavailable'));};
      document.head.append(script);
    }));
  }
  return guideLoads.get(path);
}
function appendGuides(content, name) {
  for (const [index,path] of guides[name].entries()) {
    const holder=node('div','Loading guide…');
    content.append(holder);
    loadGuide(path).then(source=>{
      const image=document.createElement('img');
      image.className='guide';
      image.src=source;
      image.alt=name+' fitting guide '+(index+1);
      const link=document.createElement('a');
      link.href=source;
      link.download=name+' guide '+(index+1)+'.webp';
      link.title='Download fitting guide';
      link.append(image);
      holder.replaceChildren(link);
    }).catch(()=>{holder.textContent='This fitting guide could not load. Open it again to retry.';holder.className='guide-error';});
  }
}
function showVehicleGuide(name) {
  get('detail-title').textContent=name+' fitting guides';
  const content=get('detail-content');
  content.replaceChildren(node('p','Select a guide to download the full image.','guide-note'));
  appendGuides(content,name);
  details.showModal();
}
const vehicleButtons=new Map();
for(const name of Object.keys(guides).sort()) {
  const button=node('button','','vehicle-card');
  button.type='button';
  const img=document.createElement('img');
  img.src=window.vehicleImages[name];
  img.alt='';
  img.loading='lazy';
  button.append(img,node('span',name));
  button.addEventListener('click',()=>{
    vehicle.value=name;
    updateYears(); page=1; render();
    get('catalog').scrollIntoView({block:'start'});
  });
  vehicleButtons.set(name,button);
  get('vehicles').append(button);
}
get('hero-photo').src=window.vehicleImages.Sorento;
const inquiry = get('inquiry');
const selectedParts = new Map();
const quoteMessage = get('quote-message');
const destination = get('destination');
const inquiryStatus = get('inquiry-status');
function updateMessage() {
  const lines = [...selectedParts.values()].map(({item, quantity}) =>
    quantity + ' × ' + item.name + ' (' + item.code + ') — ' + item.vehicle + ' ' + formatYear(item.years));
  quoteMessage.value = ['Hello Best Car Star, could you quote the following accessories?',
    '', ...lines, '', destination.value.trim() && 'Delivery to: ' + destination.value.trim(),
    'Please confirm fitment, availability, shipping cost and estimated delivery.'].join('\n');
}
function updateInquiry() {
  const list = get('inquiry-items');
  list.replaceChildren();
  for (const [item, entry] of selectedParts) {
    const title = item.name + ' · ' + item.vehicle + ' · ' + item.code;
    const row = node('li', '', 'inquiry-item');
    const label = node('label', 'Quantity');
    const quantity = document.createElement('input');
    quantity.type = 'number';
    quantity.min = '1';
    quantity.max = '999';
    quantity.value = entry.quantity;
    quantity.setAttribute('aria-label', 'Quantity for ' + title);
    quantity.addEventListener('change', () => {
      entry.quantity = Math.max(1, Math.min(999, Math.round(Number(quantity.value) || 1)));
      quantity.value = entry.quantity;
      updateMessage();
    });
    label.append(quantity);
    const remove = node('button', 'Remove', 'secondary-button');
    remove.type = 'button';
    remove.setAttribute('aria-label', 'Remove ' + title);
    remove.addEventListener('click', () => {
      selectedParts.delete(item);
      updateInquiry();
      render();
      inquiry.querySelector('.close').focus();
    });
    row.append(node('strong', title), label, remove);
    list.append(row);
  }
  get('view-inquiry').textContent = 'Inquiry (' + selectedParts.size + ')';
  get('inquiry-empty').hidden = selectedParts.size > 0;
  get('inquiry-draft').hidden = selectedParts.size === 0;
  inquiryStatus.textContent = '';
  updateMessage();
}
get('view-inquiry').addEventListener('click', () => { updateInquiry(); inquiry.showModal(); });
destination.addEventListener('input', updateMessage);
get('copy-inquiry').addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(quoteMessage.value);
    inquiryStatus.textContent = 'Inquiry copied.';
  } catch {
    quoteMessage.focus();
    quoteMessage.select();
    inquiryStatus.textContent = 'The message is selected. Copy it to share.';
  }
});
if (navigator.share) {
  const share = get('share-inquiry');
  share.hidden = false;
  share.addEventListener('click', async () => {
    try { await navigator.share({title:'Best Car Star accessory inquiry', text:quoteMessage.value}); }
    catch (error) {
      if (error.name !== 'AbortError') inquiryStatus.textContent = 'Use Copy inquiry to share this message.';
    }
  });
}
function buildChips(id, select) {
  const row = get(id);
  const scrollLeft = row.scrollLeft;
  row.replaceChildren();
  for (const option of select.options) {
    const button = node('button', option.text, 'filter-chip');
    button.type = 'button';
    button.dataset.value = option.value;
    button.addEventListener('click', () => {
      select.value = option.value;
      select.dispatchEvent(new Event(select === vehicle ? 'change' : 'input', {bubbles:true}));
      button.focus({preventScroll:true});
    });
    row.append(button);
  }
  row.scrollLeft = scrollLeft;
}
function syncChips(id, value) {
  for (const button of get(id).children) button.setAttribute('aria-pressed', String(button.dataset.value === value));
}
function render() {
  syncChips('vehicle-chips', vehicle.value);
  syncChips('year-chips', year.value);
  for(const [name,button] of vehicleButtons) button.setAttribute('aria-pressed',name===vehicle.value);
  const guidePanel=get('vehicle-guide');
  guidePanel.replaceChildren();
  if(vehicle.value) {
    const guideButton=node('button','View '+vehicle.value+' fitting guides ↗','vehicle-guide-button');
    guideButton.addEventListener('click',()=>showVehicleGuide(vehicle.value));
    guidePanel.append(guideButton);
  }
  const terms = query.value.toLowerCase().trim().split(/\s+/).filter(Boolean);
  const results = catalog.filter(item => {
    const words = [item.name,item.code,item.vehicle,item.model,item.location].join(' ').toLowerCase();
    return (!vehicle.value || item.vehicle === vehicle.value) && (!area.value || item.area === area.value)
      && yearFits(item, Number(year.value)) && terms.every(term => words.includes(term));
  });
  results.sort((a,b)=> comparePrices(a,b)
    || a.vehicle.localeCompare(b.vehicle) || a.name.localeCompare(b.name));
  const pages = Math.max(1, Math.ceil(results.length/pageSize));
  page = Math.min(page,pages);
  const first = (page-1)*pageSize;
  get('count').textContent = results.length ? `${first+1}–${Math.min(first+pageSize,results.length)} of ${results.length} accessories` : '0 accessories';
  grid.replaceChildren();
  for (const item of results.slice(first,first+pageSize)) {
    const card = get('card').content.cloneNode(true);
    for (const [selector,value] of Object.entries({'.code':'Part '+item.code,'.fit':bounds(item.years) && !/current/i.test(item.years) ? '✓ Fits '+item.vehicle+' '+formatYear(item.years) : item.vehicle+' · '+formatYear(item.years)+' · Check fit',h3:item.name,'.location':item.location,'.price':formatPrice(item)})) {
      card.querySelector(selector).textContent = value;
    }
    if (!billPrice(item)) {
      card.querySelector('.price').append(node('small', 'Estimate', 'price-estimate'));
    }
    showPartPhoto(card.querySelector('.part-photo'), item);
    if (!bounds(item.years) || /current/i.test(item.years)) card.querySelector('.fit').classList.add('fit-unconfirmed');
    const add = card.querySelector('.add-inquiry');
    add.textContent = selectedParts.has(item) ? 'View inquiry' : 'Add to inquiry';
    add.addEventListener('click', () => {
      if (!selectedParts.has(item)) selectedParts.set(item, {item, quantity:1});
      add.textContent = 'View inquiry';
      updateInquiry();
      inquiry.showModal();
    });
    const button = card.querySelector('.detail');
    button.setAttribute('aria-label','View fit details for '+item.name+' '+item.code);
    button.addEventListener('click',()=>showDetails(item));
    grid.append(card);
  }
  if (!results.length) grid.append(node('p','No accessories match these filters. Try a different year or clear a filter.','empty'));
  const navigation = get('pages');
  navigation.replaceChildren();
  if (pages > 1) {
    const previous = node('button','← Previous'), next = node('button','Next →');
    previous.disabled = page===1;
    next.disabled = page===pages;
    for (const [button,change] of [[previous,-1],[next,1]]) button.addEventListener('click',()=>{
      page+=change;
      render();
      get('catalog').scrollIntoView({block:'start'});
      get('count').setAttribute('tabindex','-1');
      get('count').focus({preventScroll:true});
    });
    navigation.append(previous,node('span',`Page ${page} of ${pages}`),next);
  }
}
options(vehicle,Object.keys(guides).sort());
buildChips('vehicle-chips', vehicle);
options(area,[...new Set(catalog.map(item=>item.area))]);
updateYears();
vehicle.addEventListener('change',updateYears);
filters.addEventListener('input',event=>{if(event.target!==vehicle){page=1;render();}});
vehicle.addEventListener('change',()=>{page=1;render();});
filters.addEventListener('submit',event=>event.preventDefault());
filters.addEventListener('reset',()=>setTimeout(()=>{sort.value='';updateYears();page=1;render();}));
sort.addEventListener('change',()=>{page=1;render();});
render();
