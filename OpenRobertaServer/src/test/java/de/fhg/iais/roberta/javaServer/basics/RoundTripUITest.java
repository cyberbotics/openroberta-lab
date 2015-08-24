package de.fhg.iais.roberta.javaServer.basics;

import java.io.IOException;
import java.util.Properties;
import java.util.concurrent.TimeUnit;

import org.eclipse.jetty.server.Server;
import org.hibernate.Session;
import org.junit.AfterClass;
import org.junit.Assert;
import org.junit.BeforeClass;
import org.junit.Test;
import org.junit.experimental.categories.Category;
import org.openqa.selenium.By;
import org.openqa.selenium.Dimension;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.phantomjs.PhantomJSDriver;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import de.fhg.iais.roberta.main.Administration;
import de.fhg.iais.roberta.main.ServerStarter;
import de.fhg.iais.roberta.persistence.util.DbSetup;
import de.fhg.iais.roberta.persistence.util.SessionFactoryWrapper;
import de.fhg.iais.roberta.util.Util;
import de.fhg.iais.roberta.util.testsetup.IntegrationTest;

@Category(IntegrationTest.class)
public class RoundTripUITest {
    private static final Logger LOG = LoggerFactory.getLogger(Administration.class);

    // XXX: why static?
    private static WebDriver driver;
    private static String baseUrl;
    private static Server server;
    private static SessionFactoryWrapper sessionFactoryWrapper;
    private static DbSetup memoryDbSetup;
    private static String connectionUrl;
    private static Session nativeSession;
    private static StringBuffer verificationErrors = new StringBuffer();
    private static JavascriptExecutor js;

    @BeforeClass
    public static void setUp() throws Exception {
        RoundTripUITest.initialize();
        RoundTripUITest.startServer();
    }

    @Test
    public void actionCreateUserAndLoginAndLogout() throws Exception {
        Assert.assertEquals(0, RoundTripUITest.getOneBigInteger("select count(*) from USER"));
        WebElement userNameElement = RoundTripUITest.driver.findElement(By.id("iconDisplayLogin"));
        String color = userNameElement.getCssValue("color");
        Assert.assertEquals("rgba(204, 204, 204, 1)", color); // Color of login-icon has to be grey now
        String userName = RoundTripUITest.js.executeScript("return userState.name;").toString();
        Assert.assertEquals("", userName);
        Integer userId = Integer.parseInt(RoundTripUITest.js.executeScript("return userState.id;").toString());
        Assert.assertTrue(userId == -1);

        // Create new user
        WebElement user = RoundTripUITest.driver.findElement(By.id("head-navi-icon-user"));
        while ( !RoundTripUITest.driver.findElement(By.id("menuNewUser")).isDisplayed() ) {
            user.click();
        }
        WebElement userNewElement = (new WebDriverWait(RoundTripUITest.driver, 10)).until(ExpectedConditions.elementToBeClickable(By.id("menuNewUser")));
        userNewElement.click();
        (new WebDriverWait(RoundTripUITest.driver, 10)).until(ExpectedConditions.visibilityOfElementLocated(By.id("saveUser")));
        RoundTripUITest.driver.findElement(By.id("accountName")).clear();
        RoundTripUITest.driver.findElement(By.id("accountName")).sendKeys("orA");
        RoundTripUITest.driver.findElement(By.id("pass1")).clear();
        RoundTripUITest.driver.findElement(By.id("pass1")).sendKeys("Pid");
        RoundTripUITest.driver.findElement(By.id("pass2")).clear();
        RoundTripUITest.driver.findElement(By.id("pass2")).sendKeys("Pid");
        RoundTripUITest.driver.findElement(By.id("userName")).clear();
        RoundTripUITest.driver.findElement(By.id("userName")).sendKeys("orA");
        RoundTripUITest.driver.findElement(By.id("userEmail")).clear();
        RoundTripUITest.driver.findElement(By.id("userEmail")).sendKeys("");
        RoundTripUITest.driver.findElement(By.id("saveUser")).click();
        (new WebDriverWait(RoundTripUITest.driver, 10)).until(ExpectedConditions.invisibilityOfElementLocated(By.id("saveUser")));
        Assert.assertEquals(1, RoundTripUITest.getOneBigInteger("select count(*) from USER"));
        color = userNameElement.getCssValue("color");
        Assert.assertEquals("rgba(175, 202, 4, 1)", color); // Color of login-icon has to be green now
        userName = RoundTripUITest.js.executeScript("return userState.name;").toString();
        Assert.assertEquals("orA", userName);
        userId = Integer.parseInt(RoundTripUITest.js.executeScript("return userState.id;").toString());
        Assert.assertTrue(userId > 0);

        // Logout
        while ( !RoundTripUITest.driver.findElement(By.id("menuLogout")).isDisplayed() ) {
            user.click();
        }
        WebElement userLogoutElement = (new WebDriverWait(RoundTripUITest.driver, 10)).until(ExpectedConditions.elementToBeClickable(By.id("menuLogout")));
        userLogoutElement.click();
        Thread.sleep(500);
        color = userNameElement.getCssValue("color");
        Assert.assertEquals("rgba(204, 204, 204, 1)", color); // Color of login-icon has to be grey now
        userName = RoundTripUITest.js.executeScript("return userState.name;").toString();
        Assert.assertEquals("", userName);
        userId = Integer.parseInt(RoundTripUITest.js.executeScript("return userState.id;").toString());
        Assert.assertTrue(userId == -1);

        // Login
        while ( !RoundTripUITest.driver.findElement(By.id("menuLogin")).isDisplayed() ) {
            user.click();
        }
        WebElement userLoginElement = (new WebDriverWait(RoundTripUITest.driver, 10)).until(ExpectedConditions.elementToBeClickable(By.id("menuLogin")));
        userLoginElement.click();
        (new WebDriverWait(RoundTripUITest.driver, 10)).until(ExpectedConditions.visibilityOfElementLocated(By.id("doLogin")));
        RoundTripUITest.driver.findElement(By.id("accountNameS")).clear();
        RoundTripUITest.driver.findElement(By.id("accountNameS")).sendKeys("orA");
        RoundTripUITest.driver.findElement(By.id("pass1S")).clear();
        RoundTripUITest.driver.findElement(By.id("pass1S")).sendKeys("Pid");
        RoundTripUITest.driver.findElement(By.id("doLogin")).click();
        (new WebDriverWait(RoundTripUITest.driver, 10)).until(ExpectedConditions.invisibilityOfElementLocated(By.id("doLogin")));
        color = userNameElement.getCssValue("color");
        Assert.assertEquals("rgba(175, 202, 4, 1)", color); // Color of login-icon has to be green now
        userName = RoundTripUITest.js.executeScript("return userState.name;").toString();
        Assert.assertEquals("orA", userName);
        userId = Integer.parseInt(RoundTripUITest.js.executeScript("return userState.id;").toString());
        Assert.assertTrue(userId > 0);

        // DeleteUser
        while ( !RoundTripUITest.driver.findElement(By.id("menuDeleteUser")).isDisplayed() ) {
            user.click();
        }
        WebElement userDeleteElement = (new WebDriverWait(RoundTripUITest.driver, 10)).until(ExpectedConditions.elementToBeClickable(By.id("menuDeleteUser")));
        userDeleteElement.click();
        (new WebDriverWait(RoundTripUITest.driver, 10)).until(ExpectedConditions.visibilityOfElementLocated(By.id("deleteUser")));
        RoundTripUITest.driver.findElement(By.id("pass1D")).clear();
        RoundTripUITest.driver.findElement(By.id("pass1D")).sendKeys("Pid");
        RoundTripUITest.driver.findElement(By.id("deleteUser")).click();
        (new WebDriverWait(RoundTripUITest.driver, 10)).until(ExpectedConditions.invisibilityOfElementLocated(By.id("deleteUser")));
        color = userNameElement.getCssValue("color");
        Assert.assertEquals("rgba(204, 204, 204, 1)", color); // Color of login-icon has to be grey now
        userName = RoundTripUITest.js.executeScript("return userState.name;").toString();
        Assert.assertEquals("", userName);
        userId = Integer.parseInt(RoundTripUITest.js.executeScript("return userState.id;").toString());
        Assert.assertTrue(userId == -1);
    }

    @AfterClass
    public static void tearDown() throws Exception {
        RoundTripUITest.driver.quit();
        String verificationErrorString = RoundTripUITest.verificationErrors.toString();
        if ( !"".equals(verificationErrorString) ) {
            Assert.fail(verificationErrorString);
        }
        RoundTripUITest.server.stop();
    }

    private static void initialize() {
        Properties properties = Util.loadProperties("classpath:openRoberta.properties");
        RoundTripUITest.connectionUrl = properties.getProperty("hibernate.connection.url");
        RoundTripUITest.sessionFactoryWrapper = new SessionFactoryWrapper("hibernate-cfg.xml", RoundTripUITest.connectionUrl);
        RoundTripUITest.nativeSession = RoundTripUITest.sessionFactoryWrapper.getNativeSession();
        RoundTripUITest.memoryDbSetup = new DbSetup(RoundTripUITest.nativeSession);
        RoundTripUITest.memoryDbSetup.runDefaultRobertaSetup();
    }

    private static void startServer() throws IOException, InterruptedException {
        RoundTripUITest.server = new ServerStarter("classpath:openRoberta1997.properties").start();
        int port = RoundTripUITest.server.getURI().getPort();
        RoundTripUITest.driver = new PhantomJSDriver();
        // workaround: https://github.com/ariya/phantomjs/issues/11637
        RoundTripUITest.driver.manage().window().setSize(new Dimension(1024, 768));
        RoundTripUITest.driver.manage().window().maximize();
        RoundTripUITest.js = (JavascriptExecutor) RoundTripUITest.driver;
        RoundTripUITest.baseUrl = "http://localhost:" + port;
        RoundTripUITest.driver.get(RoundTripUITest.baseUrl + "/");
        RoundTripUITest.driver.manage().timeouts().implicitlyWait(30, TimeUnit.SECONDS);

        //Welcome message dismiss
        RoundTripUITest.driver.findElement(By.id("hideStartupMessage")).click();
        Thread.sleep(500);
    }

    private static long getOneBigInteger(String sqlStmt) {
        return RoundTripUITest.memoryDbSetup.getOneBigInteger(sqlStmt);
    }

}
