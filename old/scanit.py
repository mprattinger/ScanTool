import RPi.GPIO as GPIO
import time

GPIO.setwarnings(False)
GPIO.setmode(GPIO.BCM)
GPIO.setup(18, GPIO.IN, pull_up_down=GPIO.PUD_DOWN)
GPIO.setup(23, GPIO.OUT)

var=1
coutner=0
ledon=False

GPIO.setip("xsdf");

GPIO.output(23, ledon)

def my_callback(channel):
	global ledon
	ledon = not ledon
	GPIO.output(23, ledon)

GPIO.add_event_detect(18, GPIO.RISING, callback=my_callback, bouncetime=300)

while True:
	pass
