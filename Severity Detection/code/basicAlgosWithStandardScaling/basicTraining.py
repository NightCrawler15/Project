#KNN, NB, RF, with standard scaling

from __future__ import division
import matplotlib.pyplot as plt
import pandas as pd
import numpy as np
from sklearn.cross_validation import KFold
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import confusion_matrix
from sklearn.svm import SVC
from sklearn.ensemble import RandomForestClassifier as RF
from sklearn.neighbors import KNeighborsClassifier as KNN
from sklearn.naive_bayes import GaussianNB as NB
import csv

def getPreProcessedFeatureTarget(fileName):
	df = pd.read_csv(fileName)
	col_names = df.columns.tolist()

	#print "Column names:"
	#print col_names

	to_show = col_names[ : 6] + col_names[-6 : ]

	#print "\nSample data:"
	#print df[to_show].head(6)

	# Target data is isolated in 'y' so that we may get second argument of fitting (separate featureCols and target values)
	# Also classifers often don't deal well with strings, convert using numpy
	targetCol = df['tar']
	y = []	 
	for i in targetCol:
		y.append(i)
	#	print type(i)
	y = np.array(y)
	#print y	
	#print type(y)

	# Discard column Target
	tooSpecific = ['tar', 'id']
	featureCols = df.drop(tooSpecific, axis = 1)
	
	# Pull out features for future use
	features = featureCols.columns
	#print "feautre cols are "
	#print featureCols
	#print "feautures are "
	#print features
	
	X = featureCols.as_matrix().astype(np.float)
	#print "X is "
	#print X
	# This is important why??? LOOK UP STANDARD SCALING (don't want negaative values? How avoid?)
	scaler = StandardScaler()
	X = scaler.fit_transform(X)

	#print "Feature space holds %d observations and %d featureCols" % X.shape
	#print "Unique target labels:", np.unique(y)
	
	return X, y


def accuracy(y_true, y_pred):
	# NumPy interprets True and False as 1. and 0.
	return np.mean(y_true == y_pred)


def run(xTrain, yTrain, xTest, classOfClassifier, **keyWordArgs):
	clf = classOfClassifier(**keyWordArgs)
	clf.fit(xTrain, yTrain)
	yPred = clf.predict(xTest)
	
	return yPred


xTrain, yTrain = getPreProcessedFeatureTarget('trainingSetPretty.csv')
xTest, yTrue =  getPreProcessedFeatureTarget('testSetPretty.csv')


df = pd.read_csv('testSetPretty.csv')
tooSpecific = ['tar']
featureCols = df.drop(tooSpecific, axis = 1)
X = featureCols.as_matrix().astype(np.float)



yPred = run(xTrain, yTrain, xTest, RF)
rows = []
rows.append(['id', 'loc', 'event', 'feature', 'vol', 'rsc', 'sev', 'tar'])
for x, y in zip(X, yPred):
	row = x.tolist()
	row.append(y)
	rows.append(row)
with open("predRF.csv", "wb") as f:
	writer = csv.writer(f)
	writer.writerows(rows)
print "Accuracy of RandomForest on test file is %.9f" % accuracy(yTrue, yPred)

yPred = run(xTrain, yTrain, xTest, NB)
rows = []
rows.append(['id', 'loc', 'event', 'feature', 'vol', 'rsc', 'sev', 'tar'])
for x, y in zip(X, yPred):
	row = x.tolist()
	row.append(y)
	rows.append(row)
with open("predNB.csv", "wb") as f:
	writer = csv.writer(f)
	writer.writerows(rows)
print "Accuracy of NB on test file is %.9f" % accuracy(yTrue, yPred)

yPred = run(xTrain, yTrain, xTest, KNN)
rows = []
rows.append(['id', 'loc', 'event', 'feature', 'vol', 'rsc', 'sev', 'tar'])
for x, y in zip(X, yPred):
	row = x.tolist()
	row.append(y)
	rows.append(row)
with open("predKNN.csv", "wb") as f:
	writer = csv.writer(f)
	writer.writerows(rows)
print "Accuracy of KNN on test file is %.9f" % accuracy(yTrue, yPred)
