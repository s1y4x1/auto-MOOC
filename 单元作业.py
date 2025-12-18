from config import *
get_homework_result=lambda tid:post(url_down,{"tid": tid,"withStdAnswerAndAnalyse": False})['result']
def homework(tid):
    while not(result:=get_homework_result(tid)):print('遇并发限制，正在重试……',end='\r')
    answers=[]
    for answer in result["subjectiveQList"]:
        answers+=[{'qid':answer['id'],'type':answer['type'],'content':{
          "content": '\n'.join(judgeDto['msg'] for judgeDto in answer['judgeDtos']),
          "attachments": []
        }}]
    result['answers']=answers
    data={"paperDto":result,"preview": False}
    response=post(url_up, data)
    return answers,response
def has_empty(tid):
    print('检查作业提交情况……',end='\r')
    while not(result:=get_homework_result(tid)):print('遇并发限制，正在重试……',end='\r')
    if not result['answers']:
        print(f'{result=}')
        return True
    for answer in result['answers']:
        content=answer['content']
        if not(content['attachments']or content['content']):return True
    return False
if __name__=='__main__':
    while True:
        homework(input('tid: ')[-10:])

