import json,time
from config import *
def quiz(tid):
    questionList=requests.get('https://ginnnnnn.top/api/mooc/test/'+str(tid)).json()['data']['questionList']
    Ans=[o['id']for q in questionList for o in q['optionList']if o['answer']]
    res=post(url_get,{'tid':tid})['result']
    answers=[]
    for Q in res['objectiveQList']:
        opt=[o['id']for o in Q['optionDtos']if o['id'] in Ans]
        answers+=[{'qid':Q['id'],'type':Q['type'],'optIds':opt,'time':int(time.time())}]
    res['answers']=answers
    data={'paperDto':res,'preview':False}
    response=post(url_up,data)
    return answers,response
if __name__=='__main__':
    while True:
        quiz(input('tid: ')[-10:])
