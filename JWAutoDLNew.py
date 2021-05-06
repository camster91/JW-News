import time
import os
import os.path
import requests
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from bs4 import BeautifulSoup

option = Options()
option.headless = False
driver = webdriver.Chrome(options=option)

os.environ['WDM_LOG_LEVEL'] = '0'

driver.get('https://www.jw.org/en/library/videos/#en/categories/LatestVideos')

time.sleep(2)

html = driver.page_source
soup = BeautifulSoup(html, 'html.parser')

master_list = []

for link in soup.find_all("div", {"class":"syn-body lss"}):
    title = link.text.strip()
    master_list.append(title)

    if len(master_list) >= 10:
        break

for i in master_list:
    
    time.sleep(3)

    nextButton = driver.find_element_by_link_text(i)
    nextButton.click()

    html = driver.page_source
    soup = BeautifulSoup(html, 'html.parser')

    time.sleep(2)

    download_button = driver.find_element_by_class_name("dropdownHandle")
    download_button.click()

    html = driver.page_source
    soup = BeautifulSoup(html, 'html.parser')

    time.sleep(2)

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

        #if search(':', title):
        #    title = title.replace(":", '')
        
        #os.rename(file_name, os.getcwd() + "\\" + title + ".mp4")

    driver.back()

driver.quit()
