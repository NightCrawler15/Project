# %matplotlib inline
import os
#from matplotlib import pyplot as plt
#import seaborn as sns
import pandas as pd
import numpy as np
import csv

with open('train.csv', 'rb') as f:
	reader = csv.reader(f)
        trainList = list(reader)
with open('event_type.csv', 'rb') as f:
	reader = csv.reader(f)
        eveList = list(reader)
with open('log_feature.csv', 'rb') as f:
	reader = csv.reader(f)
        logList = list(reader)
with open('resource_type.csv', 'rb') as f:
	reader = csv.reader(f)
        rscList = list(reader)
with open('severity_type.csv', 'rb') as f:
	reader = csv.reader(f)
        sevList = list(reader)

c = 0
rows = []
for i in trainList:
	if c >= 1:
		#print i
		custId = (i[0]).strip()
		row = []
		row.append(custId)
		row.append(i[1]) #locaation

		#event
		t = '-'
		found = False
		for j in eveList:
		#	print j[0]
			if j[0].strip() == custId:
				t += j[1] + ' - '
				found = True
			elif found == True:
				break
		row.append(t)

		#log list
		t1 = '-'
		t2 = '-'
		found = False
		for j in logList:
		#	print j[0]
			if j[0].strip() == custId:
				t1 += j[1] + ' - '
				t2 += j[2] + ' - '
				found = True
			elif found == True:
				break
		row.append(t1)
		row.append(t2)
		
		#resource
		t = '-'
		found = False
		for j in rscList:
		#	print j[0]
			if j[0].strip() == custId:
				t += j[1] + ' - '
				found = True
			elif found == True:
				break
		row.append(t)

		#severity
		t = '-'
		found = False
		for j in sevList:
		#	print j[0]
			if j[0].strip() == custId:
				t += j[1] + ' - '
				found = True
			elif found == True:
				break
		row.append(t)

		row.append(i[2])
		print row
		rows.append(row)

	c += 1


with open("trainingSet.csv", "wb") as f:
	writer = csv.writer(f)
        writer.writerows(rows)
