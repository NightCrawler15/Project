/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
package lms;

import java.sql.SQLException;

/**
 *
 * @author Gaurav
 */
public class Controller {
    boolean login_check(String username, String password) throws SQLException {
        
        Model ob = new Model();
        if (ob.loginmatch(username, password)) {
            return true;
        } else {
            return false;
        }
    }
    
    String findtype(String user, String pass) throws SQLException {
        Model ob = new Model();
        String type = ob.type(user, pass);
        
        return type;
    }
    
    void booklist_name(String name) throws SQLException {
        Model ob = new Model();
        ob.listbook_name(name);
    }
    
    void booklist_author(String name) throws SQLException {
        Model ob = new Model();
        ob.listbook_author(name);
    }
    
    boolean idcheck(String id) throws SQLException {
        Model ob = new Model();
        return ob.checkid(id);
    }
    
    void adduser(String id, String na, String mob, String type, String pass) throws SQLException {
         Model ob = new Model();
         ob.useradd(id, na, mob, type, pass);
    }
    
    boolean book_del(String id) throws SQLException {
        Model ob = new Model();
        return ob.del_book(id);
    }
    
    void add_book(String id, String name, String aut) throws SQLException {
         Model ob = new Model();
         ob.book_add(id, name, aut);
    }
    
    boolean check_issue(String bid) throws SQLException {
        Model ob = new Model();
         return ob.issue_check(bid);
    }
    
    void issue(String bid, String uid) throws SQLException {
        Model ob = new Model();
        ob.issu(bid, uid);
    }
    
    void returnbook(String bid) throws SQLException {
        Model ob = new Model();
        ob.bookreturn(bid);
    }
}
