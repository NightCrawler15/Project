import csv

with open('test_preds.csv', 'rb') as f:
	reader = csv.reader(f)
	testTar = list(reader)

with open('testSetPrettyWithoutTar.csv', 'rb') as f:
	reader = csv.reader(f)
	test = list(reader)

outRows = []
outRows.append(['id', 'loc', 'event', 'feature', 'vol', 'rsc', 'sev', 'tar'])
fInd = 1
for i in test[1 :]:
	outRow = i
	for j in testTar[fInd : ]:
		if i[0].strip() == j[0].strip(): #for cols??
			probs = [float(x) for x in j[1:]]
			outRow[-1:] = [probs.index(max(probs))]
			break
		else:
			fInd += 1
	outRows.append(outRow)


with open("testSetPretty.csv", "wb") as f:
	writer = csv.writer(f)
	writer.writerows(outRows)
					
