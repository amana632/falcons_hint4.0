#!/usr/bin/python3

import os
import subprocess
import datetime
import requests

#FIXME: Testing Issues
def login():    
    phone = int(input("Enter phone: "))
    user_type = input("Enter user_type: ")
    password = input("Enter password: ")
    url = 'http://192.168.43.247:8080/isValidUser'
    # data = {"phone": phone,
    #         "user_type": user_type,
    #         "password": password}
    headers = {'content-type': 'application/json', 'Accept-Charset': 'UTF-8'}
    r = requests.get(url, json={"phone": phone,"user_type": user_type,"password": password}, headers=headers)
    isLogged = r.json()
    if isLogged['a'] == 'True':
        print("Successfully Access Granted")
        userID = isLogged['b']
        menuStart(phone,userID)
    else:
        print("Wrong Credentials")

#Testing Entpoint to see the working
def getuserID():
    phone = input("Enter Phone number: ")
    url = 'http://192.168.43.247:8080/getUserIds/' + str(phone)
    r = requests.get(url)
    res = r.json()
    userID = res['a'][0]['user_id']
    print(userID)
    menuStart(phone,userID)  

def menuStart(phone,userID):     
    print("Choose what you want to do ")
    print("1. Press 1 to store")
    print("2. Press 2 to read")
    print("3. Press 3 to delete")
    option = int(input())
    if option == 1:
        createDir(phone,userID)
    elif option == 2:
        readData(phone,userID)
    elif option == 3:
        deleteData(phone,userID)
    else:
        print("Please enter valid option ")
        os.system("exit")

def createDir (phone,userID):           
    bool = input("Already have a directory (y/n)")
    if bool == 'y':
        storeData(phone,userID)
    else:      
        dir = input("Enter the Name of Directory ")
        os.system("sudo docker exec -u hadoop -it node4 hadoop/bin/hdfs dfs -mkdir {}".format(dir))
        print("Creating the HDFS cluster.......")
        os.system("sleep 3")
        storeData(phone,userID)

def storeData (phone,userID):
    files = input("Enter the file location which you want to upload: ")
    fileValid = subprocess.getstatusoutput("du -sh {}".format(files))
    if fileValid[0] == 0:
        size = fileValid[1].split("\t")[0]
        fileName = input("Enter the file name: ")
        des = input("Enter the destination address of folder in hdfs(/yourdir/yourfile): ")
        os.system("sudo docker cp {} node4:/home/hadoop/".format(files))
        res = os.system("sudo docker exec -u hadoop -it node4 hadoop/bin/hdfs dfs -put /home/hadoop/{} {}".format(fileName,des))
        if res == 0:
            url = 'http://192.168.43.247:8080/isTransactTill/'+ str(userID)
            r = requests.get(url)
            res = r.json()
            isTransact = res['a']
            if isTransact == 'True':
                url = 'http://192.168.43.247:8080/updateAmount/'+ str(userID)
                data = {"size": size, "flag": 1}
                headers = {'content-type': 'application/json', 'Accept-Charset': 'UTF-8'}
                r = requests.put(url, data=str(data), headers=headers)
                print("Put mar gayi")
            else:
                url = 'http://192.168.43.247:8080/newTransact/'
                #data = {"size": size, "flag": 1, "user_id": userID}
                headers = {'content-type': 'application/json', 'Accept-Charset': 'UTF-8'}
                r = requests.post(url, json={"size": size, "flag": 1, "user_id": userID}, headers=headers)
                print("Post mar gayi")
        else:
            print("Not success !")
    else:
        print("Try a valid location of file !")
    menuStart(phone,userID)
    

def readData(phone,userID):
    contents = input("Enter the path to get the lists of files ") 
    os.system("sudo docker exec -u hadoop -it node4 hadoop/bin/hdfs dfs -ls {}".format(contents)) 
    menuStart(phone,userID)


def deleteData(phone,userID):
    rmfile = input("Enter the file location which you want to delete: ")
    t = os.system("sudo docker exec -u hadoop -it node4 hadoop/bin/hdfs dfs -rm {}".format(rmfile))
    if t == 0:
        url = 'http://192.168.43.247:8080/updateAmount/'+ str(userID)
        #data = {"size": 0, "flag": 0}
        headers = {'content-type': 'application/json', 'Accept-Charset': 'UTF-8'}
        r = requests.put(url, json={"size": 0, "flag": 0}, headers=headers) 
    else :
        print("Retrieval fail or No such file exists !")
    menuStart(phone,userID)


login()