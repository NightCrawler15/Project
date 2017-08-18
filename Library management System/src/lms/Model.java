/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
package lms;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;

/**
 *
 * @author Gaurav
 */
public class Model {
    
    Connection con;
            
    
            public Model() throws SQLException {
    
                try {
                Class.forName("oracle.jdbc.OracleDriver");
                //System.out.println("connection successfull");
                    } catch(Exception e){
                System.out.println("connection not successfull");
                }
                
                con = DriverManager.getConnection("jdbc:oracle:thin:@localhost:1521:XE", "system", "iiita");
                
            }
    boolean loginmatch(String username, String password) throws SQLException {
        Statement st = con.createStatement();
        String query = "select user_id, password from SYS.users";
        
        //try {
            ResultSet res = st.executeQuery(query);
        //} catch (SQLException e) {
          //  System.out.println(e);
        //}
        boolean flag = false;
        while (res.next()) {
            String u = res.getNString("user_id");
            String p = res.getNString("password");
            
            if (u.equalsIgnoreCase(username) && p.equalsIgnoreCase(password)) {
                flag = true;
                //System.out.println("Match Found");
                break;
            }
        }
        
        if (flag == true) return true;
        else return false;
        
    }
    
    String type(String user, String pass) throws SQLException {
         Statement st = con.createStatement();
        String query = "select type from SYS.users where user_id = \'" + user + "\' and password = \'" + pass + "\'";
        ResultSet res = st.executeQuery(query);
        
        String type = "";
        while (res.next()) {
            type = res.getNString("type");
        }
        
        return type;
    }
    
    void listbook_name(String name) throws SQLException {
        Statement st = con.createStatement();
        String query = "select * from SYS.books";
        ResultSet res = st.executeQuery(query);
        
        while (res.next()) {
            String id = res.getNString("book_id");
            String na = res.getNString("book_name");
            String aut = res.getNString("author_name");
            String iss = res.getNString("issued_to");
            
            if (na.toLowerCase().contains(name.toLowerCase())) {
                System.out.println("| " + id + " | " + na + " | " + aut + " | " + iss + " |");
            }
        }
    }
    
    void listbook_author(String name) throws SQLException {
        Statement st = con.createStatement();
        String query = "select * from SYS.books";
        ResultSet res = st.executeQuery(query);
        
        while (res.next()) {
            String id = res.getNString("book_id");
            String na = res.getNString("book_name");
            String aut = res.getNString("author_name");
            String iss = res.getNString("issued_to");
            
            if (aut.toLowerCase().contains(name.toLowerCase())) {
                System.out.println("| " + id + " | " + na + " | " + aut + " | " + iss + " |");
            }
        }
    }
    
    boolean checkid(String id) throws SQLException {
        Statement st = con.createStatement();
        String query = "select * from SYS.users";
        ResultSet res = st.executeQuery(query);
        boolean flag = false;
        
        while (res.next()) {
            String h = res.getNString("user_id");
            
            if (h.equalsIgnoreCase(id)) {
                flag = true;
                break;
            }
        }
        
        if (flag) {
            
            String qu = "delete from SYS.users where user_id = \'" + id + "\'";
            res = st.executeQuery(qu);
            return true;
        } else {
            return false;
        }
    }
    
    void useradd(String id, String na, String mob, String type, String pass) throws SQLException {
            Statement st = con.createStatement();
            String query = "insert into SYS.users values (\'" + id + "\', \'" + pass + "\', \'" + type + "\', \'" + na + "\', '" + mob + "\')";
            ResultSet res = st.executeQuery(query);
    }
    
    boolean del_book(String id) throws SQLException {
        Statement st = con.createStatement();
        String query = "select * from SYS.books";
        ResultSet res = st.executeQuery(query);
        boolean flag = false;
        
        while (res.next()) {
            String h = res.getNString("book_id");
            
            if (h.equalsIgnoreCase(id)) {
                flag = true;
                break;
            }
        }
        
        if (flag) {
            
            String qu = "delete from SYS.books where book_id = \'" + id + "\'";
            res = st.executeQuery(qu);
            return true;
        } else {
            return false;
        }
    }
    
    void book_add(String id, String name, String aut) throws SQLException {
        Statement st = con.createStatement();
            String query = "insert into SYS.books(book_id, book_name, author_name) values (\'" + id + "\', \'" + name + "\', \'" + aut + "\')";
            ResultSet res = st.executeQuery(query);
    }
    
    boolean issue_check(String bid) throws SQLException {
        Statement st = con.createStatement();
        String query = "select * from SYS.books where book_id = \'" + bid + "\'";
        ResultSet res = st.executeQuery(query);
        boolean flag = false;
        
        while (res.next()) {
            String h = res.getNString("issued_to");
            
            if (h != null) {
                flag = true;
            }
        }
        
        if (flag == false) return true;
        else return false;
    }
    
    void issu(String bid, String uid) throws SQLException {
        Statement st = con.createStatement();
        String query = "update SYS.books set issued_to = \'" + uid + "\' where book_id = \'" + bid + "\'";
        ResultSet res = st.executeQuery(query);
    }
    
    void bookreturn(String bid) throws SQLException {
        Statement st = con.createStatement();
        String query = "update SYS.books set issued_to = NULL where book_id = \'" + bid + "\'";
        ResultSet res = st.executeQuery(query);
    }
}
