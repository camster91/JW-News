import time
import os
import os.path
import requests
from bs4 import BeautifulSoup
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from selenium.common.exceptions import NoSuchElementException

sections = open("D:\JW.ORG\_links.txt").readlines()

def download(section):

    option = Options()
    option.headless = False
    driver = webdriver.Chrome(options=option)

    driver.get(section)

    WebDriverWait(driver,100).until(EC.presence_of_element_located(
        (By.CLASS_NAME, "synopsisGroup"))) 

    html = driver.page_source
    soup = BeautifulSoup(html, 'html.parser')

    master_list = []
    error_list = []

    WebDriverWait(driver,1000).until(EC.presence_of_element_located(
         (By.CLASS_NAME, "synopsisGroup"))) 

    for link in soup.find_all("div", {"class":"syn-body lss"}):
        title = link.text.strip()
        master_list.append(title)

        #if len(master_list) >= 1:
            #break

    for i in master_list:
        
        WebDriverWait(driver,1000).until(EC.presence_of_element_located(
        (By.CLASS_NAME, "synopsisGroup"))) 

        try:
            WebDriverWait(driver,1000).until(EC.presence_of_element_located(
                (By.CLASS_NAME, "synopsisGroup"))) 
            nextButton = driver.find_element_by_partial_link_text(i)
            nextButton.click()
        except:
            NoSuchElementException
            error_list.append(link)
            print(error_list)
            continue

        html = driver.page_source
        soup = BeautifulSoup(html, 'html.parser')

        WebDriverWait(driver,1000).until(EC.presence_of_element_located(
                (By.CLASS_NAME, "dropdownHandle")))

        download_button = driver.find_element_by_class_name("dropdownHandle")
        download_button.click()

        html = driver.page_source
        soup = BeautifulSoup(html, 'html.parser')

        WebDriverWait(driver,1000).until(EC.presence_of_element_located(
            (By.CLASS_NAME, "secondaryButton"))) 

        file = soup.find('a', {'class':'secondaryButton'})
        file_link = file["href"]
        file_name = file["href"].split("/")[-1]

        if  os.path.isfile(file_name):
            driver.back()
            continue

        else:
            r = requests.get(file_link, allow_redirects=True) 
            open(file_name, 'wb').write(r.content)

            time_to_wait = 120
            time_counter = 0

            while not os.path.exists(file_name):
                time.sleep(1)
                time_counter += 1
                if time_counter > time_to_wait:break

        driver.back()

for section in sections:

    download(section)


