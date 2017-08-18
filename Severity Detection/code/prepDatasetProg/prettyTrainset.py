import csv

with open('trainingSet.csv', 'rb') as f:
	reader = csv.reader(f)
	trainList = list(reader)

outRows = []
outRows.append(['id', 'loc', 'event', 'feature', 'vol', 'rsc', 'sev', 'tar'])
for i in trainList:	
	loc = [int(s) for s in i[1].split() if s.isdigit()]
	events = [int(s) for s in i[2].split() if s.isdigit()]
	fts = [int(s) for s in i[3].split() if s.isdigit()]
	vol = [int(s) for s in i[4].split() if s.isdigit()]
	rsc = [int(s) for s in i[5].split() if s.isdigit()]
	sev = [int(s) for s in i[6].split() if s.isdigit()]
	tar = [int(s) for s in i[7].split() if s.isdigit()]
	for e, f, v in zip(events, fts, vol):
		outRow = []
		outRow.append(i[0])
		outRow.append(loc[0])
		outRow.append(e)
		outRow.append(f)
		outRow.append(v)
		outRow.append(rsc[0])
		outRow.append(sev[0])
		outRow.append(tar[0])
		outRows.append(outRow)

with open("trainingSetPretty.csv", "wb") as f:
	writer = csv.writer(f)
	writer.writerows(outRows)
