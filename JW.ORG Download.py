import os
import re
import requests
import time
import logging
from bs4 import BeautifulSoup
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager

# Constants
URLS_FILE = "C:\\Python JW News\\urls_and_titles.txt"
TARGET_DIRECTORY = "D:\\JW.ORG"
MAX_RETRIES = 3

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# Helper function to sanitize folder names
def sanitize_folder_name(name):
    return re.sub(r'[\/:*?"<>|]', '_', name)

# Helper function to get a unique identifier for a URL
def get_unique_identifier_for_url(url):
    return sanitize_folder_name(url.split("/")[-1] or url.split("/")[-2])

def setup_driver(url):
    driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()))
    driver.get(url)
    try:
        cookie_button = WebDriverWait(driver, 20).until(
            EC.element_to_be_clickable((By.CLASS_NAME, "lnc-acceptCookiesButton"))
        )
        cookie_button.click()
    except Exception as e:
        logging.error("Error clicking the cookie bar button: %s", e)
    return driver

def scrape_video_titles(driver, url):
    driver.get(url)
    time.sleep(5)
    html = driver.page_source
    soup = BeautifulSoup(html, 'html.parser')
    return [link.text.strip() for link in soup.find_all("div", {"class": "syn-body lss"})]

def get_page_title(driver):
    try:
        h1_element = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.TAG_NAME, "h1"))
        )
        return h1_element.text.strip()
    except Exception as e:
        logging.error("Error getting page title: %s", e)
        return "UnknownTitle"

def process_video(driver, title, target_folder, session, max_retries, url):
    try:
        element = WebDriverWait(driver, 10).until(EC.element_to_be_clickable((By.LINK_TEXT, title)))
    except Exception as e:
        logging.warning("Element with title '%s' not found on the page. Skipping...", title)
        return  # Skip to the next URL after logging the warning

    driver.execute_script("arguments[0].scrollIntoView();", element)
    element.click()
    
    WebDriverWait(driver, 10).until(EC.element_to_be_clickable((By.CLASS_NAME, "dropdownHandle"))).click()
    html = driver.page_source
    soup = BeautifulSoup(html, 'html.parser')

    file = soup.find('a', {'class': 'secondaryButton'})
    if file is None:
        logging.warning("Video file link not found for '%s'. Skipping...", title)
        driver.back()
        return  # Skip to the next URL after logging the warning

    file_link = file["href"]
    file_name = file["href"].split("/")[-1]
    
    complete_file_path = os.path.join(target_folder, file_name)
    if not os.path.isfile(complete_file_path):
        success = False
        retries = 0
        while not success and retries < max_retries:
            try:
                r = session.get(file_link, allow_redirects=True)
                r.raise_for_status()
                with open(complete_file_path, 'wb') as f:
                    f.write(r.content)
                success = True
            except requests.exceptions.RequestException as e:
                retries += 1
                if retries < max_retries:
                    logging.warning("Download failed for %s. Retrying (%d/%d)...", file_name, retries, max_retries)
                else:
                    logging.error("Download failed for %s. Skipping after %d retries.", file_name, max_retries)
    else:
        logging.info("%s already exists. Skipping download...", file_name)

    driver.back()

def main():
    with open(URLS_FILE, 'r') as file:
        urls = [line.strip() for line in file if line.strip()]

    if not urls:
        logging.error("No URLs found in the file. Exiting...")
        return

    session = requests.Session()

    def main():
        with open(URLS_FILE, 'r') as file:
            urls = [line.strip() for line in file if line.strip()]

    if not urls:
        logging.error("No URLs found in the file. Exiting...")
        return

    session = requests.Session()

    for url in urls:
        driver = setup_driver(url)

        video_titles = scrape_video_titles(driver, url)
        if not video_titles:
            logging.warning("No video titles found at URL: %s", url)
            driver.quit()
            continue  # Skip to the next URL in the URL text file

        page_title = get_page_title(driver)
        if not page_title:
            logging.warning("No H1 title found at URL: %s", url)
            page_title = "UnknownTitle"

        folder_name = sanitize_folder_name(page_title)
        target_folder = os.path.join(TARGET_DIRECTORY, folder_name)
        os.makedirs(target_folder, exist_ok=True)

        for title in video_titles:
            process_video(driver, title, target_folder, session, MAX_RETRIES, url)

        driver.quit()  # Close the browser after processing each URL

    logging.info("Done!")

if __name__ == "__main__":
    main()