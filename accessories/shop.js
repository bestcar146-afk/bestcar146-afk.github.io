'use strict';
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
const frenchNames = {
  "None Emblem Hood Guard": "Déflecteur de capot sans emblème",
  "Emblem Hood Guard": "Déflecteur de capot avec emblème",
  "Fog Lamp Garnish": "Garniture d’antibrouillard",
  "Head Lamp Garnish": "Garniture de phare",
  "Radiator Grill Garnish": "Garniture de calandre",
  "Chrome Door Visor": "Déflecteur de vitre chromé",
  "Smoked Door Visor": "Déflecteur de vitre fumé",
  "Black Diamond Door Visor": "Déflecteur de vitre Black Diamond",
  "Window Accent": "Baguette de vitre",
  "C Pillar Molding": "Garniture de montant C",
  "PVC Pillar Molding": "Garniture de montant en PVC",
  "Rear Pillar Molding": "Garniture de montant arrière",
  "A Pillar Molding": "Garniture de montant A",
  "Mirror Bracket Molding": "Garniture d’embase de rétroviseur",
  "Fuel Cover Molding": "Garniture de trappe à carburant",
  "Step Side Mirror Garnish": "Garniture de rétroviseur latéral Step",
  "Side Mirror Garnish": "Garniture de rétroviseur latéral",
  "Door Handle Molding": "Garniture de poignée de porte",
  "Door Bowl Molding": "Garniture de creux de poignée",
  "Door Molding Kit": "Kit de garnitures de porte",
  "Side Skirt Accent": "Garniture de bas de caisse",
  "Fender Guard": "Protection d’aile",
  "Fender Molding": "Garniture d’aile",
  "Rear Lamp Garnish": "Garniture de feu arrière",
  "Rear Window Accent": "Baguette de lunette arrière",
  "Rear Molding Kit": "Kit de garnitures arrière",
  "Chrome Bumper Molding": "Garniture de pare-chocs chromée",
  "Rear Bumper Accent": "Garniture de pare-chocs arrière",
  "Trunk Garnish": "Garniture de coffre",
  "Interior Molding Kit": "Kit de garnitures intérieures",
  "Wiper Molding Kit": "Kit de garnitures d’essuie-glace",
  "Wiper Molidng Kit": "Kit de garnitures d’essuie-glace",
  "Chrome Lip Spoiler": "Lame de pare-chocs chromée",
  "Number Plate Garnish": "Garniture de plaque d’immatriculation",
  "Rear Mirror Garnish": "Garniture de rétroviseur arrière"
};
const frenchLocations = {
  "Along the front edge of the hood": "Le long du bord avant du capot",
  "Around the fog lights": "Autour des antibrouillards",
  "Around the headlights": "Autour des phares",
  "On the front grille": "Sur la calandre avant",
  "Above the side door windows": "Au-dessus des vitres latérales",
  "Along the side window trim": "Le long des garnitures de vitres latérales",
  "Along the upper edge of the side windows": "Le long du bord supérieur des vitres latérales",
  "On the upright body panel near the rear side window": "Sur le montant près de la vitre latérale arrière",
  "On the vertical posts between or beside side windows": "Sur les montants entre les vitres latérales ou à côté",
  "Beside the windshield, at its outer edges": "Sur les côtés du pare-brise",
  "Around the mounting base of the outside mirrors": "Autour de l’embase des rétroviseurs extérieurs",
  "On the exterior fuel filler door": "Sur la trappe à carburant",
  "On the outside mirror housings": "Sur les coques des rétroviseurs extérieurs",
  "Over the exterior door handles": "Sur les poignées extérieures",
  "In the recess behind each exterior door handle": "Dans le creux derrière chaque poignée extérieure",
  "On the outside of the doors": "Sur l’extérieur des portes",
  "On the exterior fuel filler door. Verify listed year.": "Sur la trappe à carburant. Vérifiez l’année du véhicule.",
  "Along the lower body below the doors": "Le long du bas de caisse sous les portes",
  "Around the wheel openings": "Autour des passages de roue",
  "Around the taillights": "Autour des feux arrière",
  "Along the rear window trim": "Le long de la garniture de la lunette arrière",
  "On the rear body panels. See the photo guide for the pieces.": "Sur les panneaux de carrosserie arrière",
  "On the rear bumper": "Sur le pare-chocs arrière",
  "On the trunk lid or tailgate": "Sur le coffre ou le hayon",
  "On trim panels inside the cabin": "Sur les garnitures intérieures",
  "Around the wiper assembly. Confirm front or rear.": "Autour des essuie-glaces. Vérifiez la position.",
  "On a body edge. Check the mounting point in the photo.": "Sur un bord de carrosserie. Vérifiez la position.",
  "On the bumper. Check which end and trim level.": "Sur le pare-chocs. Vérifiez la position et la finition.",
  "Around the number plate. Confirm front or rear.": "Autour de la plaque d’immatriculation. Vérifiez la position.",
  "On a mirror. Confirm the exact position from the photo.": "Sur un rétroviseur. Vérifiez la position."
};

const {catalog} = window;
const get = id => document.getElementById(id);
const vehicle = get('vehicle'), year = get('year'), area = get('area'), sort = get('sort'), query = get('query');
const cart = get('cart');
const language = get('language');
const cartKey = 'bcs-accessory-cart-v1';
const pageSize = 18;
let page = 1;

const labels = {
  subtitle:['Accessories Catalog','Catalogue d’accessoires'], heading:['Search by vehicle','Rechercher par véhicule'],
  currency:['Prices in MGA','Prix en MGA'], vehicle:['Vehicle','Véhicule'], year:['Model year','Année du modèle'],
  area:['Car area','Zone du véhicule'], search:['Search','Recherche'], reset:['Reset','Réinitialiser'],
  sort:['Sort','Trier'], low:['Lowest price','Prix croissant'], high:['Highest price','Prix décroissant'],
  anyVehicle:['All vehicles','Tous les véhicules'], anyYear:['Any year','Toutes les années'], anyArea:['All areas','Toutes les zones'],
  placeholder:['Part name or code','Nom ou référence'], photo:['Photo unavailable','Photo indisponible'],
  part:['Part','Réf.'], onward:['onward','et après'], add:['Add to cart','Ajouter au panier'], added:['Added to cart','Ajouté au panier'],
  estimate:['Estimate','Estimation'], cart:['Cart','Panier'], cartTitle:['Shopping cart','Panier'],
  emptyCart:['Your cart is empty.','Votre panier est vide.'], close:['Close cart','Fermer le panier'],
  quantity:['Quantity','Quantité'], remove:['Remove','Retirer'], total:['Subtotal','Sous-total'],
  shipping:['Availability and delivery are confirmed separately.','La disponibilité et la livraison sont confirmées séparément.'],
  whatsapp:['Send cart to WhatsApp','Envoyer le panier sur WhatsApp'],
  chooseContact:['Choose your Best Car Star contact in WhatsApp.','Choisissez votre contact Best Car Star dans WhatsApp.'],
  top:['Back to top','Retour en haut'], previous:['← Previous','← Précédent'], next:['Next →','Suivant →'],
  noResults:['No accessories match these filters.','Aucun accessoire ne correspond à ces filtres.'],
  greeting:['Hello Best Car Star, I’d like to order these accessories:','Bonjour Best Car Star, je souhaite commander ces accessoires :'],
  confirm:['Please confirm availability and delivery.','Merci de confirmer la disponibilité et la livraison.'],
  units:['accessories','accessoires'],
};
const frenchAreas = {
  'Front of vehicle':'Avant du véhicule', 'Side windows & pillars':'Vitres latérales et montants',
  'Doors & mirrors':'Portes et rétroviseurs', 'Wheel arches & lower sides':'Passages de roue et bas de caisse',
  'Rear of vehicle':'Arrière du véhicule', 'Inside the cabin':'Habitacle', 'Confirm exact position':'Position à vérifier',
};
function readStorage(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
  catch { return fallback; }
}
function saveStorage(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
}
let lang = readStorage('bcs-accessory-language','en') === 'fr' ? 'fr' : 'en';
const t = key => labels[key][lang === 'fr' ? 1 : 0];
const itemKey = item => JSON.stringify([item.vehicle,item.code,item.model,item.years]);
const byKey = new Map(catalog.map(item => [itemKey(item),item]));
const stored = readStorage(cartKey,{});
const selected = new Map(Object.entries(stored && typeof stored === 'object' ? stored : {})
  .filter(([key, qty]) => byKey.has(key) && Number.isInteger(qty) && qty >= 1 && qty <= 999));
const krw = item => window.billPrices.map[item.vehicle]?.[item.code]?.price;
const price = item => (krw(item) ?? estimatedPrices[itemKey(item)]) * 10;
const money = amount => amount.toLocaleString(lang === 'fr' ? 'fr-FR' : 'en-US') + ' MGA';
const yearText = item => item.years.replace('~','–').replace(/current/i,t('onward'));
function partName(item) {
  if (lang !== 'fr') return item.name;
  const base = Object.keys(frenchNames).find(name => item.name.startsWith(name));
  if (!base) return item.name;
  return frenchNames[base] + item.name.slice(base.length)
    .replace(/without LED/gi,'sans LED').replace(/with LED/gi,'avec LED')
    .replace(/black/gi,'noir').replace(/chrome/gi,'chromé').replace(/red/gi,'rouge')
    .replace(/luxury/gi,'luxe').replace(/smart key/gi,'clé intelligente')
    .replace(/upper/gi,'supérieur').replace(/_low\b/gi,' inférieur')
    .replace(/center/gi,'centre').replace(/wing/gi,'latérale');
}
function locationText(item) {
  if (lang === 'fr') return frenchLocations[item.location] ?? item.location;
  return item.location.replace(' See the photo guide for the pieces.','');
}
function node(tag, value, className) {
  const el = document.createElement(tag);
  el.textContent = value;
  if (className) el.className = className;
  return el;
}
function action(text, className, handler) {
  const button = node('button',text,className);
  button.type = 'button';
  button.addEventListener('click',handler);
  return button;
}
function assignOptions(select, rows) {
  const value = select.value;
  select.replaceChildren(...rows.map(([key,label]) => new Option(label,key)));
  if (rows.some(([key]) => key === value)) select.value = value;
}
function bounds(value) {
  const years = (value.match(/\b(?:19|20)\d{2}\b/g) ?? []).map(Number);
  if (years.length === 2 && years[0] <= years[1]) return years;
  if (years.length === 1 && /current/i.test(value)) return [years[0], Infinity];
  if (years.length === 1 && !value.includes('~')) return [years[0],years[0]];
  return null;
}
function updateYears() {
  const years = new Set();
  for (const item of catalog) {
    if (vehicle.value && item.vehicle !== vehicle.value) continue;
    const range = bounds(item.years);
    if (!range) continue;
    const last = Math.min(range[1],new Date().getFullYear());
    for (let y = range[0]; y <= last; y++) years.add(y);
  }
  assignOptions(year,[['',t('anyYear')], ...[...years].sort((a,b)=>b-a).map(y=>[String(y),String(y)])]);
}
function showPhoto(container, item) {
  const fallback = window.accessoryPhotos?.[item.vehicle]?.[item.code];
  const image = document.createElement('img');
  image.loading = 'lazy';
  image.referrerPolicy = 'no-referrer';
  image.alt = partName(item) + ' — ' + item.vehicle + ' (' + item.code + ')';
  image.addEventListener('error', () => {
    if (fallback && image.getAttribute('src') !== fallback) image.src = fallback;
    else container.replaceChildren(node('span',t('photo')));
  });
  if (/^[A-Z][0-9]{3}$/.test(item.code)) {
    image.src = 'https://www.autoclover.com/autoclover/upload/itemcard/' + item.code + '_std_0.jpg';
  } else if (fallback) image.src = fallback;
  else { container.replaceChildren(node('span',t('photo'))); return; }
  container.append(image);
}
const normalize = value => value.normalize('NFD').replace(/\p{Diacritic}/gu,'').toLowerCase();
function render() {
  const terms = normalize(query.value.trim()).split(/\s+/).filter(Boolean);
  const chosenYear = Number(year.value);
  const ranked = catalog.filter(item => {
    if ((vehicle.value && item.vehicle !== vehicle.value) || (area.value && item.area !== area.value)) return false;
    const range = bounds(item.years);
    if (chosenYear && (!range || chosenYear < range[0] || chosenYear > range[1])) return false;
    const words = normalize([item.name,partName(item),item.code,item.vehicle,item.model,locationText(item)].join(' '));
    return terms.every(term=>words.includes(term));
  });
  ranked.sort((a,b) =>
    (sort.value === 'low' ? price(a)-price(b) : sort.value === 'high' ? price(b)-price(a) : 0)
    || a.vehicle.localeCompare(b.vehicle) || partName(a).localeCompare(partName(b),lang));
  const pages = Math.max(1,Math.ceil(ranked.length / pageSize));
  page = Math.min(page,pages);
  const offset = (page-1)*pageSize;
  const count = ranked.length ? (offset+1)+'–'+Math.min(offset+pageSize,ranked.length)+' '+(lang==='fr'?'sur':'of')+' '+ranked.length : '0';
  get('count').textContent = count+' '+t('units');
  const grid = get('grid');
  grid.replaceChildren();
  for (const item of ranked.slice(offset,offset+pageSize)) {
    const card = get('card').content.cloneNode(true);
    card.querySelector('h3').textContent = partName(item);
    card.querySelector('.fit').textContent = item.vehicle+' · '+yearText(item);
    card.querySelector('.code').textContent = t('part')+' '+item.code;
    card.querySelector('.location').textContent = locationText(item);
    const amount = card.querySelector('.price');
    amount.textContent = money(price(item));
    if (krw(item) == null) amount.append(node('small',t('estimate'),'price-estimate'));
    showPhoto(card.querySelector('.part-photo'),item);
    const add = card.querySelector('.add-cart');
    add.textContent = t('add');
    add.addEventListener('click',()=>{
      const key = itemKey(item);
      const quantity = Math.min(999,(selected.get(key) ?? 0)+1);
      selected.set(key,quantity);
      updateCart();
      get('cart-status').textContent = t('added')+' · '+partName(item)+' · '+quantity;
      add.textContent = t('added')+' ('+quantity+')';
    });
    grid.append(card);
  }
  if (!ranked.length) grid.append(node('p',t('noResults'),'empty'));
  const navigation = get('pages');
  navigation.replaceChildren();
  if (pages > 1) {
    const move = change => {
      page += change;
      render();
      get('catalog').scrollIntoView({block:'start'});
      get('count').setAttribute('tabindex','-1');
      get('count').focus({preventScroll:true});
    };
    const previous = action(t('previous'),'',()=>move(-1));
    const next = action(t('next'),'',()=>move(1));
    previous.disabled = page === 1;
    next.disabled = page === pages;
    navigation.append(previous,node('span',page+' / '+pages),next);
  }
}
function updateCart() {
  const list = get('cart-items');
  const entries = [...selected].map(([key,quantity])=>({key,item:byKey.get(key),quantity}));
  const total = entries.reduce((sum,{item,quantity})=>sum+price(item)*quantity,0);
  const count = entries.reduce((sum,{quantity})=>sum+quantity,0);
  get('cart-open').textContent = t('cart')+' ('+count+')';
  get('cart-empty').hidden = count > 0;
  get('cart-summary').hidden = count === 0;
  get('cart-total').textContent = t('total')+' · '+money(total);
  const whatsapp = get('whatsapp');
  if (count) {
    const message = [t('greeting'),'',...entries.map(({item,quantity})=>
      quantity+' × '+partName(item)+' ('+item.code+') — '+item.vehicle+' '+yearText(item)+
      ' — '+money(price(item)*quantity)+(krw(item)==null?' ('+t('estimate')+')':'')),
      '',t('total')+' · '+money(total),t('confirm')].join('\n');
    whatsapp.href = 'https://wa.me/?text='+encodeURIComponent(message);
  } else whatsapp.removeAttribute('href');
  list.replaceChildren();
  for (const {key,item,quantity} of entries) {
    const name = partName(item)+' · '+item.vehicle+' · '+item.code;
    const row = node('li','','inquiry-item');
    const title = node('strong',name);
    title.append(node('span',money(price(item))+(krw(item)==null?' · '+t('estimate'):'')+' × '+quantity,'cart-line-price'));
    const label = node('label',t('quantity'));
    const input = document.createElement('input');
    input.type = 'number';
    input.min = '1'; input.max = '999'; input.value = quantity;
    input.setAttribute('aria-label',t('quantity')+' · '+name);
    input.addEventListener('change',()=>{
      selected.set(key,Math.max(1,Math.min(999,Math.round(Number(input.value)||1))));
      updateCart();
    });
    label.append(input);
    const remove = action(t('remove'),'secondary-button',()=>{
      selected.delete(key);
      updateCart();
      get('cart-close').focus();
    });
    remove.setAttribute('aria-label',t('remove')+' · '+name);
    row.append(title,label,remove);
    list.append(row);
  }
  saveStorage(cartKey,Object.fromEntries(selected));
}
function localize() {
  document.documentElement.lang = lang;
  language.value = lang;
  document.title = (lang==='fr'?'Accessoires auto':'Car Accessories')+' | Best Car Star';
  for (const control of document.querySelectorAll('[data-text]')) control.textContent=t(control.dataset.text);
  query.placeholder = t('placeholder');
  get('cart-close').setAttribute('aria-label',t('close'));
  get('top-button').setAttribute('aria-label',t('top'));
  get('top-button').title = t('top');
  const vehicles = [...new Set(catalog.map(i=>i.vehicle))].sort();
  assignOptions(vehicle,[['',t('anyVehicle')],...vehicles.map(name=>[name,name])]);
  const areas = [...new Set(catalog.map(i=>i.area))];
  assignOptions(area,[['',t('anyArea')],...areas.map(name=>[name,lang==='fr'?frenchAreas[name]:name])]);
  updateYears();
  render();
  updateCart();
}
language.addEventListener('change',()=>{
  lang = language.value;
  saveStorage('bcs-accessory-language',lang);
  localize();
});
get('cart-open').addEventListener('click',()=>{updateCart();cart.showModal();});
vehicle.addEventListener('change',()=>{updateYears();page=1;render();});
for (const control of [year,area,sort]) control.addEventListener('change',()=>{page=1;render();});
query.addEventListener('input',()=>{page=1;render();});
const filters = get('filters');
filters.addEventListener('submit',e=>e.preventDefault());
filters.addEventListener('reset',()=>setTimeout(()=>{sort.value='';page=1;updateYears();render();}));
const topButton = get('top-button');
function updateTop() { topButton.hidden = window.scrollY < 230; }
window.addEventListener('scroll',updateTop,{passive:true});
localize();
updateTop();
